import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoteButtonsProps {
  answerId: string;
  initialVoteCount: number;
  userVote?: 'up' | 'down' | null;
  onVoteChange?: (newVoteCount: number) => void;
}

export function VoteButtons({ 
  answerId, 
  initialVoteCount, 
  userVote, 
  onVoteChange 
}: VoteButtonsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(userVote || null);
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on answers.",
        variant: "destructive",
      });
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      let newVoteCount = voteCount;
      
      if (currentVote === voteType) {
        // Remove vote
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('answer_id', answerId)
          .eq('user_id', user.id);

        if (error) throw error;

        newVoteCount = voteCount - (voteType === 'up' ? 1 : -1);
        setCurrentVote(null);
      } else if (currentVote) {
        // Update existing vote
        const { error } = await supabase
          .from('votes')
          .update({ vote_type: voteType })
          .eq('answer_id', answerId)
          .eq('user_id', user.id);

        if (error) throw error;

        newVoteCount = voteCount + (voteType === 'up' ? 2 : -2);
        setCurrentVote(voteType);
      } else {
        // Create new vote
        const { error } = await supabase
          .from('votes')
          .insert({
            answer_id: answerId,
            user_id: user.id,
            vote_type: voteType,
          });

        if (error) throw error;

        newVoteCount = voteCount + (voteType === 'up' ? 1 : -1);
        setCurrentVote(voteType);
      }

      setVoteCount(newVoteCount);
      onVoteChange?.(newVoteCount);

    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error voting",
        description: "Failed to record your vote. Please try again.",
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
            ? 'text-primary bg-primary/10' 
            : 'text-muted-foreground hover:text-primary'
        }`}
      >
        <ChevronUp className="h-5 w-5" />
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
            ? 'text-destructive bg-destructive/10' 
            : 'text-muted-foreground hover:text-destructive'
        }`}
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
}