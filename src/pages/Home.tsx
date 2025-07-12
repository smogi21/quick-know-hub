import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, MessageSquare, User, Calendar, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock data for questions
const mockQuestions = [
  {
    id: 1,
    title: "How to implement authentication with Supabase in React?",
    description: "I'm trying to set up authentication in my React app using Supabase. What's the best approach for handling login, logout, and session management?",
    tags: ["react", "supabase", "authentication"],
    author: { username: "john_dev", id: "1" },
    voteCount: 15,
    answerCount: 3,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    title: "Best practices for TypeScript in large React applications",
    description: "What are some proven patterns and best practices when using TypeScript in large-scale React applications? Looking for advice on project structure, type definitions, and maintainability.",
    tags: ["typescript", "react", "best-practices"],
    author: { username: "sarah_ts", id: "2" },
    voteCount: 23,
    answerCount: 7,
    createdAt: "2024-01-14T15:45:00Z"
  },
  {
    id: 3,
    title: "Optimizing database queries in Supabase with RLS",
    description: "I'm working with Row Level Security in Supabase and noticed some performance issues. How can I optimize my queries while maintaining proper security?",
    tags: ["supabase", "database", "performance", "rls"],
    author: { username: "db_expert", id: "3" },
    voteCount: 8,
    answerCount: 2,
    createdAt: "2024-01-13T09:15:00Z"
  }
];

export default function Home() {
  const [questions] = useState(mockQuestions);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Questions</h1>
          <p className="text-muted-foreground mt-1">
            Find answers to your technical questions from the community
          </p>
        </div>
        <Link to="/ask">
          <Button>Ask Question</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{questions.length}</div>
            <p className="text-xs text-muted-foreground">Total Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">
              {questions.reduce((acc, q) => acc + q.answerCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total Answers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">156</div>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <Card key={question.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                {/* Vote and Stats */}
                <div className="flex flex-col items-center space-y-2 min-w-20">
                  <div className="flex flex-col items-center">
                    <Button variant="ghost" size="sm" className="p-1">
                      <ChevronUp className="h-5 w-5" />
                    </Button>
                    <span className="text-lg font-semibold">{question.voteCount}</span>
                    <Button variant="ghost" size="sm" className="p-1">
                      <ChevronDown className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{question.answerCount}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">answers</span>
                  </div>
                </div>

                {/* Question Content */}
                <div className="flex-1">
                  <Link
                    to={`/question/${question.id}`}
                    className="block group"
                  >
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      {question.title}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {question.description}
                    </p>
                  </Link>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Author and Time */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {question.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{question.author.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatTimeAgo(question.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}