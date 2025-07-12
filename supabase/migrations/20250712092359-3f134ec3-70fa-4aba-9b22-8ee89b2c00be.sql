-- Create question_votes table for voting on questions
CREATE TABLE public.question_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Enable RLS
ALTER TABLE public.question_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for question votes
CREATE POLICY "Question votes are viewable by everyone" 
ON public.question_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert question votes" 
ON public.question_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question votes" 
ON public.question_votes 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own question votes" 
ON public.question_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add vote_count column to questions table
ALTER TABLE public.questions ADD COLUMN vote_count INTEGER DEFAULT 0;

-- Create function to update question vote count
CREATE OR REPLACE FUNCTION public.update_question_vote_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.questions 
    SET vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.questions 
    SET vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = OLD.question_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.questions 
    SET vote_count = vote_count + 
      CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END -
      CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END
    WHERE id = NEW.question_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Create trigger for question vote count updates
CREATE TRIGGER update_question_vote_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.question_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_question_vote_count();