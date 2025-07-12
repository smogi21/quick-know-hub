import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarDays, Star, Trophy, Award, MessageSquare, Eye, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ReputationBadge } from '@/components/ReputationBadge';
import { UserBadges } from '@/components/UserBadges';
import { formatTimeAgo } from '@/utils/dateUtils';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  reputation: number;
  role: string;
  created_at: string;
}

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  view_count: number;
  answer_count: number;
  created_at: string;
}

interface Answer {
  id: string;
  content: string;
  vote_count: number;
  is_accepted: boolean;
  created_at: string;
  questions: {
    id: string;
    title: string;
  };
}

interface UserBadge {
  id: string;
  earned_at: string;
  badges: {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: string;
  };
}

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = userId || user?.id;
  const isOwnProfile = user?.id === currentUserId;

  useEffect(() => {
    if (currentUserId) {
      fetchProfile();
      fetchUserContent();
      fetchUserBadges();
    }
  }, [currentUserId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserContent = async () => {
    try {
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id, title, description, tags, view_count, answer_count, created_at')
        .eq('author_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // Fetch answers
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select(`
          id, content, vote_count, is_accepted, created_at,
          questions:question_id (
            id, title
          )
        `)
        .eq('author_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (answersError) throw answersError;
      setAnswers(answersData || []);
    } catch (error) {
      console.error('Error fetching user content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          id, earned_at,
          badges:badge_id (
            id, name, description, icon, tier
          )
        `)
        .eq('user_id', currentUserId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-muted-foreground">Profile not found</h1>
      </div>
    );
  }

  const stats = [
    { label: 'Questions', value: questions.length, icon: MessageSquare },
    { label: 'Answers', value: answers.length, icon: MessageSquare },
    { label: 'Reputation', value: profile.reputation, icon: Star },
    { label: 'Badges', value: badges.length, icon: Award },
  ];

  const tierColors = {
    bronze: 'text-amber-600',
    silver: 'text-gray-500',
    gold: 'text-yellow-500',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-2xl">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold">{profile.username}</h1>
                {profile.role === 'admin' && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Star className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <ReputationBadge reputation={profile.reputation} />
                <div className="flex items-center text-muted-foreground">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  <span>Member since {formatTimeAgo(profile.created_at)}</span>
                </div>
              </div>

            {/* User Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <UserBadges userId={profile.user_id} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <stat.icon className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="questions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
          <TabsTrigger value="answers">Answers ({answers.length})</TabsTrigger>
          <TabsTrigger value="badges">Badges ({badges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Questions</CardTitle>
              <CardDescription>
                {isOwnProfile ? 'Your' : `${profile.username}'s`} latest questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No questions posted yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="border-b pb-4 last:border-b-0">
                      <Link 
                        to={`/question/${question.id}`}
                        className="block hover:bg-muted/50 p-4 rounded-lg transition-colors"
                      >
                        <h3 className="font-medium text-lg mb-2 hover:text-primary">
                          {question.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {question.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {question.view_count} views
                            </span>
                            <span className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              {question.answer_count} answers
                            </span>
                          </div>
                          <span>{formatTimeAgo(question.created_at)}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="answers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Answers</CardTitle>
              <CardDescription>
                {isOwnProfile ? 'Your' : `${profile.username}'s`} latest answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {answers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No answers posted yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {answers.map((answer) => (
                    <div key={answer.id} className="border-b pb-4 last:border-b-0">
                      <Link 
                        to={`/question/${answer.questions?.id}`}
                        className="block hover:bg-muted/50 p-4 rounded-lg transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium hover:text-primary">
                            {answer.questions?.title}
                          </h3>
                          {answer.is_accepted && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Trophy className="w-3 h-3 mr-1" />
                              Accepted
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            {answer.vote_count} votes
                          </span>
                          <span>{formatTimeAgo(answer.created_at)}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earned Badges</CardTitle>
              <CardDescription>
                Recognition for {isOwnProfile ? 'your' : `${profile.username}'s`} contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No badges earned yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((userBadge) => (
                    <div 
                      key={userBadge.id} 
                      className="flex items-center space-x-3 p-4 border rounded-lg"
                    >
                      <div className={`text-2xl ${tierColors[userBadge.badges.tier as keyof typeof tierColors] || 'text-muted-foreground'}`}>
                        {userBadge.badges.icon}
                      </div>
                      <div>
                        <h4 className="font-medium">{userBadge.badges.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {userBadge.badges.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Earned {formatTimeAgo(userBadge.earned_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}