import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

// Dummy leaderboard data
const leaderboardData = [
  {
    id: 1,
    username: 'CodeMaster',
    reputation: 2840,
    questionsAsked: 45,
    answersGiven: 123,
    acceptedAnswers: 89,
    avatar: null,
    badges: ['Expert', 'Helpful', 'Scholar']
  },
  {
    id: 2,
    username: 'DevGuru',
    reputation: 2156,
    questionsAsked: 32,
    answersGiven: 98,
    acceptedAnswers: 72,
    avatar: null,
    badges: ['Mentor', 'Problem Solver']
  },
  {
    id: 3,
    username: 'TechWizard',
    reputation: 1943,
    questionsAsked: 28,
    answersGiven: 87,
    acceptedAnswers: 65,
    avatar: null,
    badges: ['Innovator', 'Helper']
  },
  {
    id: 4,
    username: 'ReactNinja',
    reputation: 1678,
    questionsAsked: 22,
    answersGiven: 76,
    acceptedAnswers: 54,
    avatar: null,
    badges: ['React Expert']
  },
  {
    id: 5,
    username: 'JSExpert',
    reputation: 1534,
    questionsAsked: 19,
    answersGiven: 69,
    acceptedAnswers: 48,
    avatar: null,
    badges: ['JavaScript Pro']
  },
  {
    id: 6,
    username: 'FullStackDev',
    reputation: 1289,
    questionsAsked: 15,
    answersGiven: 58,
    acceptedAnswers: 42,
    avatar: null,
    badges: ['Full Stack']
  },
  {
    id: 7,
    username: 'TypeScriptPro',
    reputation: 1156,
    questionsAsked: 12,
    answersGiven: 52,
    acceptedAnswers: 38,
    avatar: null,
    badges: ['TypeScript Expert']
  },
  {
    id: 8,
    username: 'CSSMaster',
    reputation: 987,
    questionsAsked: 8,
    answersGiven: 45,
    acceptedAnswers: 33,
    avatar: null,
    badges: ['Design Pro']
  }
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return <span className="h-6 w-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

export default function Leaderboard() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Community Leaderboard</h1>
          <p className="text-muted-foreground">
            Top contributors and most helpful community members
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Questions
              </CardTitle>
              <MessageSquare className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Answers
              </CardTitle>
              <ThumbsUp className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,567</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Star className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
            <CardDescription>
              Users ranked by reputation and community engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardData.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(index + 1)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || ''} alt={user.username} />
                      <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.username}</h3>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.badges.map((badge) => (
                          <Badge key={badge} variant="secondary" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="text-lg font-bold text-primary">{user.reputation}</div>
                    <div className="text-xs text-muted-foreground space-x-4">
                      <span>{user.questionsAsked} questions</span>
                      <span>{user.answersGiven} answers</span>
                      <span>{user.acceptedAnswers} accepted</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}