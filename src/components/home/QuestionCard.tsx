import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Question } from '@/types';
import { ReputationBadge } from '@/components/ReputationBadge';
import { UserBadges } from '@/components/UserBadges';
import { formatTimeAgo } from '@/utils/dateUtils';

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
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
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
          </div>
          <div className="flex flex-col items-end space-y-1 ml-4">
            <div className="text-sm text-muted-foreground">
              {question.view_count} views
            </div>
            <div className="text-sm text-muted-foreground">
              {question.answer_count} answers
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
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
          <span>{formatTimeAgo(question.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}