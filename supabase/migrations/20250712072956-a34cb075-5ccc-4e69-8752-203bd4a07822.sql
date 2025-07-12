-- Create notification trigger function
CREATE OR REPLACE FUNCTION public.create_notification(
  user_id_param UUID,
  type_param TEXT,
  message_param TEXT,
  question_id_param UUID DEFAULT NULL,
  answer_id_param UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    message,
    related_question_id,
    related_answer_id
  ) VALUES (
    user_id_param,
    type_param,
    message_param,
    question_id_param,
    answer_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger function for new answers
CREATE OR REPLACE FUNCTION public.notify_question_author_on_answer()
RETURNS TRIGGER AS $$
DECLARE
  question_author_id UUID;
  question_title TEXT;
  answer_author_username TEXT;
BEGIN
  -- Get question author and title
  SELECT author_id, title INTO question_author_id, question_title
  FROM public.questions 
  WHERE id = NEW.question_id;
  
  -- Get answer author username
  SELECT username INTO answer_author_username
  FROM public.profiles
  WHERE user_id = NEW.author_id;
  
  -- Don't notify if author answers their own question
  IF question_author_id != NEW.author_id THEN
    -- Create notification for question author
    PERFORM public.create_notification(
      question_author_id,
      'answer',
      answer_author_username || ' answered your question "' || question_title || '"',
      NEW.question_id,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger function for accepted answers
CREATE OR REPLACE FUNCTION public.notify_answer_author_on_accept()
RETURNS TRIGGER AS $$
DECLARE
  answer_author_username TEXT;
  question_title TEXT;
BEGIN
  -- Only proceed if answer was just accepted
  IF NEW.is_accepted = true AND (OLD.is_accepted = false OR OLD.is_accepted IS NULL) THEN
    -- Get answer author username
    SELECT username INTO answer_author_username
    FROM public.profiles
    WHERE user_id = NEW.author_id;
    
    -- Get question title
    SELECT title INTO question_title
    FROM public.questions
    WHERE id = NEW.question_id;
    
    -- Create notification for answer author
    PERFORM public.create_notification(
      NEW.author_id,
      'accepted',
      'Your answer to "' || question_title || '" was accepted!',
      NEW.question_id,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create triggers
CREATE TRIGGER trigger_notify_on_answer
  AFTER INSERT ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_question_author_on_answer();

CREATE TRIGGER trigger_notify_on_accept
  AFTER UPDATE ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_answer_author_on_accept();

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.notifications;