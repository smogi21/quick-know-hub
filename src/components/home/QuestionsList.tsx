import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Question, User } from '@/types';
import { QuestionCard } from './QuestionCard';

interface QuestionsListProps {
  questions: Question[];
  loading: boolean;
  filter: string;
  user: User | null;
  searchQuery: string;
}

export function QuestionsList({ 
  questions, 
  loading, 
  filter, 
  user, 
  searchQuery 
}: QuestionsListProps) {
  const getTitle = () => {
    switch (filter) {
      case 'newest':
        return 'Recent Questions';
      case 'unanswered':
        return 'Unanswered Questions';
      case 'most-voted':
        return 'Most Viewed Questions';
      default:
        return 'Questions';
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <Card>
      <CardContent className="py-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No questions found</h3>
        <p className="text-muted-foreground mb-4">
          {searchQuery 
            ? "Try adjusting your search terms or filters"
            : "Be the first to ask a question!"
          }
        </p>
        {user && (
          <Link to="/ask">
            <Button>Ask the First Question</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        {user && (
          <Link to="/ask">
            <Button>Ask Question</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : questions.length === 0 ? (
        <EmptyState />
      ) : (
        questions.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))
      )}
    </div>
  );
}