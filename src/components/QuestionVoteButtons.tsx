import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuestionVoteButtonsProps {
  questionId: string;
  initialVoteCount: number;
  userVote?: 'up' | 'down' | null;
  onVoteChange?: (newVoteCount: number) => void;
}

export function QuestionVoteButtons({ 
  questionId, 
  initialVoteCount, 
  userVote, 
  onVoteChange 
}: QuestionVoteButtonsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(userVote || null);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to vote on questions",
        variant: "destructive",
      });
      return;
    }

    if (isVoting) return;
    setIsVoting(true);

    try {
      let newVoteCount = voteCount;
      let newCurrentVote: 'up' | 'down' | null = voteType;

      // Check if user already voted on this question
      const { data: existingVote } = await supabase
        .from('question_votes')
        .select('*')
        .eq('question_id', questionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote (clicking same button)
          await supabase
            .from('question_votes')
            .delete()
            .eq('question_id', questionId)
            .eq('user_id', user.id);
          
          newVoteCount += existingVote.vote_type === 'up' ? -1 : 1;
          newCurrentVote = null;
        } else {
          // Change vote type
          await supabase
            .from('question_votes')
            .update({ vote_type: voteType })
            .eq('question_id', questionId)
            .eq('user_id', user.id);
          
          newVoteCount += existingVote.vote_type === 'up' ? -2 : 2;
          newCurrentVote = voteType;
        }
      } else {
        // Create new vote
        await supabase
          .from('question_votes')
          .insert({
            question_id: questionId,
            user_id: user.id,
            vote_type: voteType
          });
        
        newVoteCount += voteType === 'up' ? 1 : -1;
        newCurrentVote = voteType;
      }

      // Update question vote_count in database
      await supabase
        .from('questions')
        .update({ vote_count: newVoteCount })
        .eq('id', questionId);

      setVoteCount(newVoteCount);
      setCurrentVote(newCurrentVote);
      onVoteChange?.(newVoteCount);

    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('up')}
        disabled={isVoting}
        className={`p-1 h-8 w-8 ${
          currentVote === 'up' 
            ? 'text-orange-500 bg-orange-50 hover:bg-orange-100' 
            : 'hover:text-orange-500 hover:bg-orange-50'
        }`}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      
      <span className={`text-sm font-medium ${
        voteCount > 0 ? 'text-green-600' : 
        voteCount < 0 ? 'text-red-600' : 
        'text-muted-foreground'
      }`}>
        {voteCount}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleVote('down')}
        disabled={isVoting}
        className={`p-1 h-8 w-8 ${
          currentVote === 'down' 
            ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' 
            : 'hover:text-blue-500 hover:bg-blue-50'
        }`}
      >
        <ArrowDown className="h-5 w-5" />
      </Button>
    </div>
  );
}