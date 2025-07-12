import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Question } from '@/types';

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const fetchQuestions = async (
    currentPage: number,
    questionsPerPage: number,
    searchQuery: string,
    filter: string
  ) => {
    setLoading(true);
    console.log('Fetching questions with params:', { currentPage, questionsPerPage, searchQuery, filter });
    
    try {
      let query = supabase
        .from('questions')
        .select(`
          *,
          profiles:author_id (
            username,
            avatar_url,
            reputation
          )
        `, { count: 'exact' })
        .range((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage - 1);

      console.log('Base query created');

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`
        );
      }

      // Apply sorting
      switch (filter) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'unanswered':
          query = query.eq('answer_count', 0).order('created_at', { ascending: false });
          break;
        case 'most-voted':
          query = query.order('view_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error, count } = await query;
      console.log('Query result:', { data, error, count });

      if (error) {
        console.error('Error fetching questions:', error);
        setQuestions([]);
        setTotalQuestions(0);
        return;
      }

      if (data) {
        // If user is logged in, fetch their question votes
        let questionsWithVotes = data;
        
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            const questionIds = data.map(q => q.id);
            const { data: votesData } = await supabase
              .from('question_votes')
              .select('question_id, vote_type')
              .eq('user_id', userData.user.id)
              .in('question_id', questionIds);
            
            questionsWithVotes = data.map(question => {
              const userVote = votesData?.find(vote => vote.question_id === question.id);
              return {
                ...question,
                user_vote: userVote ? { vote_type: userVote.vote_type } : undefined
              };
            });
          }
        } catch (voteError) {
          console.log('Could not fetch vote data:', voteError);
        }
        
        setQuestions(questionsWithVotes);
        setTotalQuestions(count || 0);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    loading,
    totalQuestions,
    fetchQuestions
  };
}