import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Send } from 'lucide-react';

const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(150, 'Title must be less than 150 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters'),
  tags: z.array(z.string()).min(1, 'Please add at least one tag').max(5, 'Maximum 5 tags allowed'),
});

type QuestionForm = z.infer<typeof questionSchema>;

export default function AskQuestion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: '',
      description: '',
      tags: [],
    },
  });

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image', 'align'
  ];

  const handleDescriptionChange = (content: string) => {
    setDescription(content);
    setValue('description', content);
    trigger('description');
  };

  const addTag = () => {
    const trimmedTag = currentTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      const newTags = [...tags, trimmedTag];
      setTags(newTags);
      setValue('tags', newTags);
      setCurrentTag('');
      trigger('tags');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
    trigger('tags');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: QuestionForm) => {
    setIsSubmitting(true);
    try {
      const { data: questionData, error } = await supabase
        .from('questions')
        .insert({
          title: data.title,
          description: data.description,
          tags: data.tags,
          author_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Question posted successfully!",
        description: "Your question has been published and is now visible to the community.",
      });

      navigate(`/question/${questionData.id}`);
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Failed to post question",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Ask a Question</h1>
        <p className="text-muted-foreground">
          Get help from the community by asking a detailed question
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
          <CardDescription>
            Be specific and imagine you're asking a question to another person
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. How do I implement authentication in React with TypeScript?"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Be specific and imagine you're asking a question to another person
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <div className="min-h-[200px] border rounded-md">
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={handleDescriptionChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Provide details about your question. Include any code, error messages, or what you've already tried..."
                  className="h-48"
                />
              </div>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Include all the information someone would need to answer your question
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag (e.g., react, javascript, css)"
                    disabled={tags.length >= 5}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    disabled={!currentTag.trim() || tags.length >= 5}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {errors.tags && (
                <p className="text-sm text-destructive">{errors.tags.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Add up to 5 tags to describe what your question is about
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Question
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Writing a good question</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">Steps to ask a good question:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Search to see if your question has been asked before</li>
              <li>• Write a title that summarizes the specific problem</li>
              <li>• Describe the problem in detail</li>
              <li>• Include what you've tried and what didn't work</li>
              <li>• Add relevant tags to help others find your question</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}