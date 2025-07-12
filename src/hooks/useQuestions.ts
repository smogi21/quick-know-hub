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

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      if (data) {
        setQuestions(data);
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