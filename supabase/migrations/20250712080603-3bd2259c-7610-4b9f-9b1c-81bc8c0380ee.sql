-- Add reputation and badges system
ALTER TABLE public.profiles 
ADD COLUMN reputation integer NOT NULL DEFAULT 0;

-- Create badges table
CREATE TABLE public.badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  icon text NOT NULL,
  points_required integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_badges table for many-to-many relationship
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for badges (viewable by everyone)
CREATE POLICY "Badges are viewable by everyone" 
ON public.badges 
FOR SELECT 
USING (true);

-- RLS policies for user_badges
CREATE POLICY "User badges are viewable by everyone" 
ON public.user_badges 
FOR SELECT 
USING (true);

CREATE POLICY "Users can earn badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO public.badges (name, description, tier, icon, points_required) VALUES
('First Question', 'Asked your first question', 'bronze', '❓', 0),
('First Answer', 'Posted your first answer', 'bronze', '💬', 0),
('Nice Question', 'Question received 10 upvotes', 'bronze', '👍', 50),
('Good Question', 'Question received 25 upvotes', 'silver', '⭐', 125),
('Great Question', 'Question received 100 upvotes', 'gold', '🏆', 500),
('Nice Answer', 'Answer received 10 upvotes', 'bronze', '✅', 100),
('Good Answer', 'Answer received 25 upvotes', 'silver', '🌟', 250),
('Great Answer', 'Answer received 100 upvotes', 'gold', '👑', 1000),
('Scholar', 'First accepted answer', 'bronze', '🎓', 15),
('Teacher', '10 accepted answers', 'silver', '👨‍🏫', 150),
('Mentor', '50 accepted answers', 'gold', '🧙‍♂️', 750),
('Enthusiast', 'Visited 30 consecutive days', 'bronze', '🔥', 0),
('Fanatic', 'Visited 100 consecutive days', 'silver', '❤️', 0);

-- Function to update reputation
CREATE OR REPLACE FUNCTION public.update_user_reputation(user_id_param uuid, points_change integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles 
  SET reputation = GREATEST(0, reputation + points_change)
  WHERE user_id = user_id_param;
END;
$$;

-- Function to award badge
CREATE OR REPLACE FUNCTION public.award_badge(user_id_param uuid, badge_name_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  badge_id_var uuid;
BEGIN
  -- Get badge ID
  SELECT id INTO badge_id_var FROM public.badges WHERE name = badge_name_param;
  
  -- Insert if not already earned
  INSERT INTO public.user_badges (user_id, badge_id)
  VALUES (user_id_param, badge_id_var)
  ON CONFLICT (user_id, badge_id) DO NOTHING;
END;
$$;

-- Trigger to update reputation and award badges on votes
CREATE OR REPLACE FUNCTION public.handle_vote_reputation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  answer_author_id uuid;
  question_author_id uuid;
  question_id_var uuid;
  points_change integer;
BEGIN
  -- Get answer author and question info
  SELECT author_id, question_id INTO answer_author_id, question_id_var 
  FROM public.answers WHERE id = COALESCE(NEW.answer_id, OLD.answer_id);
  
  SELECT author_id INTO question_author_id 
  FROM public.questions WHERE id = question_id_var;
  
  IF TG_OP = 'INSERT' THEN
    points_change := CASE WHEN NEW.vote_type = 'up' THEN 10 ELSE -2 END;
    PERFORM public.update_user_reputation(answer_author_id, points_change);
  ELSIF TG_OP = 'DELETE' THEN
    points_change := CASE WHEN OLD.vote_type = 'up' THEN -10 ELSE 2 END;
    PERFORM public.update_user_reputation(answer_author_id, points_change);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type != NEW.vote_type THEN
      points_change := CASE 
        WHEN NEW.vote_type = 'up' THEN 12  -- +10 for up, +2 to undo down
        ELSE -12  -- -10 for removing up, -2 for down
      END;
      PERFORM public.update_user_reputation(answer_author_id, points_change);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to award badges on answer acceptance
CREATE OR REPLACE FUNCTION public.handle_accepted_answer_reputation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only proceed if answer was just accepted
  IF NEW.is_accepted = true AND (OLD.is_accepted = false OR OLD.is_accepted IS NULL) THEN
    -- Award 15 points for accepted answer
    PERFORM public.update_user_reputation(NEW.author_id, 15);
    
    -- Award Scholar badge for first accepted answer
    PERFORM public.award_badge(NEW.author_id, 'Scholar');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER handle_vote_reputation_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.handle_vote_reputation();

CREATE TRIGGER handle_accepted_answer_reputation_trigger
  AFTER UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.handle_accepted_answer_reputation();