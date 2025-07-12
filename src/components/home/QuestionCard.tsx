import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Question } from '@/types';
import { ReputationBadge } from '@/components/ReputationBadge';
import { UserBadges } from '@/components/UserBadges';
import { formatTimeAgo } from '@/utils/dateUtils';
import { QuestionVoteButtons } from '@/components/QuestionVoteButtons';

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const truncateDescription = (description: string, maxLength: number = 150): string => {
    return description.length > maxLength 
      ? `${description.substring(0, maxLength)}...`
      : description;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex space-x-4">
          {/* Vote buttons */}
          <div className="flex-shrink-0">
            <QuestionVoteButtons
              questionId={question.id}
              initialVoteCount={question.vote_count || 0}
              userVote={question.user_vote?.vote_type || null}
            />
          </div>
          
          {/* Question content */}
          <div className="flex-1 space-y-3">
            <CardTitle className="text-lg hover:text-primary cursor-pointer">
              <Link to={`/question/${question.id}`}>
                {question.title}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {truncateDescription(question.description)}
            </CardDescription>
            <div className="flex flex-wrap gap-2">
              {question.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Stats and author info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <span>Asked by </span>
                <Link 
                  to={`/profile/${question.author_id}`}
                  className="hover:text-primary hover:underline"
                >
                  {question.profiles?.username || 'Unknown'}
                </Link>
                <ReputationBadge 
                  reputation={question.profiles?.reputation || 0} 
                  className="text-xs"
                />
                <UserBadges userId={question.author_id} limit={2} />
              </div>
              <div className="flex items-center gap-4">
                <span>{question.view_count} views</span>
                <span>{question.answer_count} answers</span>
                <span>{formatTimeAgo(question.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}