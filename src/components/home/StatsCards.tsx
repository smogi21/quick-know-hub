import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, TrendingUp } from 'lucide-react';
import { Question } from '@/types';
import { User } from '@/types';

interface StatsCardsProps {
  totalQuestions: number;
  user: User | null;
  questions: Question[];
}

export function StatsCards({ totalQuestions, user, questions }: StatsCardsProps) {
  const questionsToday = questions.filter(q => 
    new Date(q.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalQuestions}</div>
          <p className="text-xs text-muted-foreground">Community knowledge base</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Status</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{user ? 'Member' : 'Guest'}</div>
          <p className="text-xs text-muted-foreground">
            {user ? `Welcome back, ${user.username}!` : 'Join to participate'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Questions Today</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{questionsToday}</div>
          <p className="text-xs text-muted-foreground">Fresh content</p>
        </CardContent>
      </Card>
    </div>
  );
}