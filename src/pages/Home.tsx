import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuestions } from '@/hooks/useQuestions';
import { StatsCards } from '@/components/home/StatsCards';
import { SearchAndFilter } from '@/components/home/SearchAndFilter';
import { QuestionsList } from '@/components/home/QuestionsList';
import { Pagination } from '@/components/home/Pagination';
import { Layout } from '@/components/layout/Layout';

export default function Home() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  const { questions, loading, totalQuestions, fetchQuestions } = useQuestions();

  useEffect(() => {
    fetchQuestions(currentPage, questionsPerPage, searchQuery, filter);
  }, [currentPage, searchQuery, filter]);

  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <StatsCards 
          totalQuestions={totalQuestions}
          user={user}
          questions={questions}
        />

        <SearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
        />

        <QuestionsList
          questions={questions}
          loading={loading}
          filter={filter}
          user={user}
          searchQuery={searchQuery}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </Layout>
  );
}