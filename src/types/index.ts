export interface Question {
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
    reputation: number;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}