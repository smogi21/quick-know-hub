import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, ArrowDown, Check, Eye, Clock, User, Edit, Trash2, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  author_id: string;
  view_count: number;
  answer_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    role: string;
  };
}

interface Answer {
  id: string;
  content: string;
  author_id: string;
  question_id: string;
  vote_count: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
    role: string;
  };
  user_vote?: {
    vote_type: 'up' | 'down';
  };
}

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestion = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:author_id (
            username,
            avatar_url,
            role
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setQuestion(data);

      // Increment view count
      await supabase
        .from('questions')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id);

    } catch (error) {
      console.error('Error fetching question:', error);
      toast({
        title: "Error",
        description: "Failed to load question",
        variant: "destructive",
      });
    }
  };

  const fetchAnswers = async () => {
    if (!id) return;
    
    try {
      // Fetch answers first
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select(`
          *,
          profiles:author_id (
            username,
            avatar_url,
            role
          )
        `)
        .eq('question_id', id)
        .order('is_accepted', { ascending: false })
        .order('vote_count', { ascending: false });

      if (answersError) throw answersError;

      // If user is logged in, fetch their votes separately
      if (user && answersData) {
        const answerIds = answersData.map(answer => answer.id);
        const { data: votesData } = await supabase
          .from('votes')
          .select('answer_id, vote_type')
          .eq('user_id', user.id)
          .in('answer_id', answerIds);

        // Combine answers with user votes
        const answersWithVotes = answersData.map(answer => {
          const userVote = votesData?.find(vote => vote.answer_id === answer.id);
          return {
            ...answer,
            user_vote: userVote ? { vote_type: userVote.vote_type as 'up' | 'down' } : undefined
          };
        });

        setAnswers(answersWithVotes);
      } else {
        setAnswers(answersData || []);
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
  }, [id, user]);

  const handleVote = async (answerId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to vote on answers",
        variant: "destructive",
      });
      return;
    }

    try {
      const existingVote = answers.find(a => a.id === answerId)?.user_vote;
      
      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase
            .from('votes')
            .delete()
            .eq('answer_id', answerId)
            .eq('user_id', user.id);
        } else {
          // Update vote
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('answer_id', answerId)
            .eq('user_id', user.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('votes')
          .insert({
            answer_id: answerId,
            user_id: user.id,
            vote_type: voteType
          });
      }

      fetchAnswers(); // Refresh to show updated votes
      toast({
        title: "Success",
        description: "Vote recorded",
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive",
      });
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question || user.id !== question.author_id) return;

    try {
      const answer = answers.find(a => a.id === answerId);
      const newAcceptedStatus = !answer?.is_accepted;

      // If accepting, unaccept all other answers first
      if (newAcceptedStatus) {
        await supabase
          .from('answers')
          .update({ is_accepted: false })
          .eq('question_id', id);
      }

      await supabase
        .from('answers')
        .update({ is_accepted: newAcceptedStatus })
        .eq('id', answerId);

      fetchAnswers();
      toast({
        title: "Success",
        description: newAcceptedStatus ? "Answer accepted" : "Answer unaccepted",
      });
    } catch (error) {
      console.error('Error accepting answer:', error);
      toast({
        title: "Error",
        description: "Failed to update answer status",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user || !newAnswer.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('answers')
        .insert({
          content: newAnswer,
          author_id: user.id,
          question_id: id
        });

      if (error) throw error;

      setNewAnswer('');
      fetchAnswers();
      toast({
        title: "Success",
        description: "Answer submitted successfully",
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!user || !question || (user.id !== question.author_id && user.role !== 'admin')) return;

    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      toast({
        title: "Success",
        description: "Question deleted",
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading || !question) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <span>Question</span>
      </nav>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              <CardTitle className="text-2xl leading-tight">{question.title}</CardTitle>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Meta info */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{question.view_count} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Asked {formatTimeAgo(question.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {(user?.id === question.author_id || user?.role === 'admin') && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeleteQuestion}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Question content */}
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: question.description }}
          />

          <Separator />

          {/* Author info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={question.profiles?.avatar_url || ''} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{question.profiles?.username}</p>
                <p className="text-sm text-muted-foreground">
                  {question.profiles?.role === 'admin' && (
                    <Badge variant="destructive" className="text-xs">Admin</Badge>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.map((answer) => (
          <Card key={answer.id} className={answer.is_accepted ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}>
            <CardContent className="pt-6">
              <div className="flex space-x-4">
                {/* Voting */}
                <div className="flex flex-col items-center space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(answer.id, 'up')}
                    className={`p-1 ${answer.user_vote?.vote_type === 'up' ? 'text-green-600' : ''}`}
                  >
                    <ArrowUp className="h-5 w-5" />
                  </Button>
                  <span className="font-semibold text-lg">{answer.vote_count}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(answer.id, 'down')}
                    className={`p-1 ${answer.user_vote?.vote_type === 'down' ? 'text-red-600' : ''}`}
                  >
                    <ArrowDown className="h-5 w-5" />
                  </Button>

                  {/* Accept button */}
                  {user?.id === question.author_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAcceptAnswer(answer.id)}
                      className={`p-1 ${answer.is_accepted ? 'text-green-600' : ''}`}
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                {/* Answer content */}
                <div className="flex-1 space-y-4">
                  {answer.is_accepted && (
                    <Badge className="bg-green-600 hover:bg-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Accepted Answer
                    </Badge>
                  )}
                  
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />

                  {/* Answer meta */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={answer.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <span className="font-medium">{answer.profiles?.username}</span>
                        {answer.profiles?.role === 'admin' && (
                          <Badge variant="destructive" className="text-xs ml-2">Admin</Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(answer.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Answer */}
      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReactQuill
              value={newAnswer}
              onChange={setNewAnswer}
              placeholder="Write your answer..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'code-block'],
                  ['clean']
                ]
              }}
            />
            <Button 
              onClick={handleSubmitAnswer}
              disabled={!newAnswer.trim() || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              You must be logged in to submit an answer
            </p>
            <Link to="/auth">
              <Button>Log in / Sign up</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}