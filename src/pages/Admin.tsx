import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users, MessageSquare, MessageCircle, TrendingUp, Ban, CheckCircle, Download, Megaphone, Edit, Trash2, UserMinus, UserPlus, Settings, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

interface DashboardStats {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  todayQuestions: number;
}

interface User {
  id: string;
  user_id: string;
  username: string;
  role: string;
  created_at: string;
  is_banned?: boolean;
}

interface Question {
  id: string;
  title: string;
  description: string;
  view_count: number;
  answer_count: number;
  created_at: string;
  tags: string[];
  profiles: {
    username: string;
  };
}

interface Answer {
  id: string;
  content: string;
  vote_count: number;
  created_at: string;
  question_id: string;
  profiles: {
    username: string;
  };
  questions: {
    title: string;
  };
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
  profiles: {
    username: string;
  };
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalQuestions: 0,
    totalAnswers: 0,
    todayQuestions: 0,
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit dialogs
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  // Announcement form
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

  // Check admin session
  const adminSession = localStorage.getItem('adminSession');
  const adminLoginTime = localStorage.getItem('adminLoginTime');
  const sessionExpired = adminLoginTime && (Date.now() - parseInt(adminLoginTime)) > 24 * 60 * 60 * 1000; // 24 hours

  if (!adminSession || sessionExpired) {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminLoginTime');
    return <Navigate to="/admin-login" replace />;
  }

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total questions
      const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      // Get total answers
      const { count: answersCount } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true });

      // Get today's questions
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      setStats({
        totalUsers: usersCount || 0,
        totalQuestions: questionsCount || 0,
        totalAnswers: answersCount || 0,
        todayQuestions: todayCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          profiles:author_id (
            username
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchAnswers = async () => {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          profiles:author_id (
            username
          ),
          questions:question_id (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAnswers(data || []);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles:author_id (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchQuestions(),
      fetchAnswers(),
      fetchAnnouncements(),
    ]);
  }, []);

  const handleBanUser = async (userId: string, username: string) => {
    try {
      // Update user role to 'banned'
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'banned' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "User Banned",
        description: `${username} has been banned from the platform`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const handleUnbanUser = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "User Unbanned",
        description: `${username} has been unbanned`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      });
    }
  };

  const handleMakeAdmin = async (userId: string, username: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Admin Role Granted",
        description: `${username} is now an admin`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error making admin:', error);
      toast({
        title: "Error",
        description: "Failed to grant admin role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string, title: string) => {
    try {
      await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      toast({
        title: "Question Deleted",
        description: `"${title}" has been deleted`,
      });
      
      fetchQuestions();
      fetchStats();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleEditQuestion = async (questionId: string, title: string, description: string, tags: string[]) => {
    try {
      const { error } = await supabase
        .from('questions')
        .update({ title, description, tags })
        .eq('id', questionId);

      if (error) throw error;

      toast({
        title: "Question Updated",
        description: "Question has been successfully updated",
      });
      
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    try {
      await supabase
        .from('answers')
        .delete()
        .eq('id', answerId);

      toast({
        title: "Answer Deleted",
        description: "Answer has been deleted",
      });
      
      fetchAnswers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast({
        title: "Error",
        description: "Failed to delete answer",
        variant: "destructive",
      });
    }
  };

  const handleToggleAnnouncement = async (announcementId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !isActive })
        .eq('id', announcementId);

      if (error) throw error;

      toast({
        title: isActive ? "Announcement Deactivated" : "Announcement Activated",
        description: `Announcement has been ${isActive ? 'hidden' : 'shown'}`,
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement:', error);
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await supabase
        .from('announcements')
        .delete()
        .eq('id', announcementId);

      toast({
        title: "Announcement Deleted",
        description: "Announcement has been deleted",
      });
      
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminLoginTime');
    window.location.href = '/admin-login';
  };

  const handleSubmitAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementBody.trim()) return;

    setSubmittingAnnouncement(true);
    try {
      // Use hardcoded admin ID since we're using session-based auth
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: announcementTitle,
          body: announcementBody,
          author_id: users.find(u => u.role === 'admin')?.user_id || 'admin',
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement posted successfully",
      });

      setAnnouncementTitle('');
      setAnnouncementBody('');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error posting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to post announcement",
        variant: "destructive",
      });
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const exportUserData = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Username,Role,Created At\n" +
      users.map(u => `${u.username},${u.role},${u.created_at}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportQuestionData = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Title,Author,Views,Answers,Created At\n" +
      questions.map(q => `"${q.title}",${q.profiles?.username},${q.view_count},${q.answer_count},${q.created_at}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "questions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Badge variant="destructive">Admin Panel</Badge>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">Community questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Answers</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnswers}</div>
            <p className="text-xs text-muted-foreground">Helpful responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Questions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayQuestions}</div>
            <p className="text-xs text-muted-foreground">New today</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="answers">Answers</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their roles</CardDescription>
              </div>
              <Button onClick={exportUserData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.role === 'banned' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUnbanUser(user.user_id, user.username)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Unban
                            </Button>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Ban className="h-4 w-4 mr-2" />
                                  Ban
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Ban User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to ban {user.username}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleBanUser(user.user_id, user.username)}
                                  >
                                    Ban User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          
                          {user.role !== 'admin' && (
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleMakeAdmin(user.user_id, user.username)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Make Admin
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Question Management</CardTitle>
                <CardDescription>Review and moderate community questions</CardDescription>
              </div>
              <Button onClick={exportQuestionData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Answers</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {question.title}
                      </TableCell>
                      <TableCell>{question.profiles?.username || 'Unknown'}</TableCell>
                      <TableCell>{question.view_count}</TableCell>
                      <TableCell>{question.answer_count}</TableCell>
                      <TableCell>{formatDate(question.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingQuestion(question)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Question</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{question.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteQuestion(question.id, question.title)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="answers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Answer Management</CardTitle>
                <CardDescription>Review and moderate community answers</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {answers.map((answer) => (
                    <TableRow key={answer.id}>
                      <TableCell className="max-w-xs truncate">
                        <div dangerouslySetInnerHTML={{ __html: answer.content.substring(0, 100) + '...' }} />
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{answer.questions?.title}</TableCell>
                      <TableCell>{answer.profiles?.username || 'Unknown'}</TableCell>
                      <TableCell>{answer.vote_count}</TableCell>
                      <TableCell>{formatDate(answer.created_at)}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Answer</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this answer? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAnswer(answer.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post Announcement</CardTitle>
              <CardDescription>Share important updates with the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="Announcement title..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  placeholder="Announcement message..."
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleSubmitAnnouncement}
                disabled={!announcementTitle.trim() || !announcementBody.trim() || submittingAnnouncement}
              >
                <Megaphone className="h-4 w-4 mr-2" />
                {submittingAnnouncement ? 'Posting...' : 'Post Announcement'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Announcements</CardTitle>
              <CardDescription>Manage posted announcements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {announcement.title}
                      </TableCell>
                      <TableCell>{announcement.profiles?.username}</TableCell>
                      <TableCell>
                        <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                          {announcement.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(announcement.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleAnnouncement(announcement.id, announcement.is_active)}
                          >
                            {announcement.is_active ? 'Hide' : 'Show'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{announcement.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Analytics</CardTitle>
              <CardDescription>Overview of platform content metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Most Active Users</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Top contributors by questions asked
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Popular Tags</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Most frequently used question tags
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Answer Rate</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Percentage of questions with answers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Export User Data</CardTitle>
                <CardDescription>Download user activity reports</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportUserData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Users CSV
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Export Question Data</CardTitle>
                <CardDescription>Download question analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={exportQuestionData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Questions CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <Dialog open={!!editingQuestion} onOpenChange={() => setEditingQuestion(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Question</DialogTitle>
              <DialogDescription>
                Modify the question details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingQuestion.title}
                  onChange={(e) => setEditingQuestion({...editingQuestion, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingQuestion.description}
                  onChange={(e) => setEditingQuestion({...editingQuestion, description: e.target.value})}
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={editingQuestion.tags?.join(', ') || ''}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="javascript, react, programming"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setEditingQuestion(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => handleEditQuestion(
                  editingQuestion.id, 
                  editingQuestion.title, 
                  editingQuestion.description,
                  editingQuestion.tags || []
                )}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}