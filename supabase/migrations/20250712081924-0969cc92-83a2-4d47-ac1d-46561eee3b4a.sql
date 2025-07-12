-- Insert sample questions and answers to populate the database
INSERT INTO public.questions (id, title, description, tags, author_id, view_count, answer_count, created_at, updated_at) VALUES
('00000000-0000-4000-8000-000000000001', 'How to use React Hooks effectively?', '<p>I''m new to React and trying to understand hooks. Can someone explain the best practices for using useState and useEffect?</p><p>Specifically, I''m confused about:</p><ul><li>When to use useEffect cleanup functions</li><li>How to handle multiple state variables</li><li>Performance optimization with useMemo</li></ul>', ARRAY['react', 'javascript', 'hooks'], (SELECT user_id FROM public.profiles LIMIT 1), 42, 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('00000000-0000-4000-8000-000000000002', 'Best practices for database design in PostgreSQL?', '<p>I''m designing a new application and need advice on PostgreSQL database design.</p><p>Key questions:</p><ul><li>How to structure tables for scalability</li><li>When to use indexes</li><li>Normalization vs denormalization trade-offs</li></ul>', ARRAY['postgresql', 'database', 'design'], (SELECT user_id FROM public.profiles LIMIT 1), 38, 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

('00000000-0000-4000-8000-000000000003', 'How to implement authentication with Supabase?', '<p>I''m building a web app and want to add user authentication. Supabase seems like a good option.</p><p>What I need help with:</p><ul><li>Setting up email/password auth</li><li>Protecting routes</li><li>Managing user sessions</li></ul>', ARRAY['supabase', 'authentication', 'security'], (SELECT user_id FROM public.profiles LIMIT 1), 56, 4, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('00000000-0000-4000-8000-000000000004', 'Tailwind CSS vs styled-components: Which to choose?', '<p>I''m starting a new React project and torn between Tailwind CSS and styled-components.</p><p>Considerations:</p><ul><li>Learning curve</li><li>Performance implications</li><li>Team collaboration</li><li>Maintenance over time</li></ul>', ARRAY['css', 'tailwind', 'react', 'styling'], (SELECT user_id FROM public.profiles LIMIT 1), 73, 5, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),

('00000000-0000-4000-8000-000000000005', 'TypeScript generics: When and how to use them?', '<p>I understand basic TypeScript but generics still confuse me. Can someone explain:</p><ul><li>Real-world use cases for generics</li><li>How to write reusable functions with generics</li><li>Generic constraints and when to use them</li></ul>', ARRAY['typescript', 'generics', 'programming'], (SELECT user_id FROM public.profiles LIMIT 1), 29, 2, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');

-- Insert sample answers
INSERT INTO public.answers (id, content, author_id, question_id, vote_count, is_accepted, created_at, updated_at) VALUES
('00000000-0000-4000-8000-100000000001', '<p>Great question! Here are the key React Hooks best practices:</p><h3>useState Tips:</h3><ul><li>Keep state as simple as possible</li><li>Use multiple useState calls for unrelated state</li><li>Use functional updates when state depends on previous state</li></ul><h3>useEffect Guidelines:</h3><ul><li>Always include dependencies in the dependency array</li><li>Use cleanup functions for subscriptions and timers</li><li>Separate concerns into different useEffect hooks</li></ul><p>Example:</p><pre><code>useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return () => clearInterval(timer); // Cleanup
}, []); // Empty deps = run once</code></pre>', (SELECT user_id FROM public.profiles LIMIT 1), '00000000-0000-4000-8000-000000000001', 15, true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('00000000-0000-4000-8000-100000000002', '<p>For performance optimization, here''s what you need to know about useMemo:</p><ul><li>Use it for expensive calculations</li><li>Don''t overuse it - premature optimization is bad</li><li>Profile first, optimize second</li></ul><p>Example:</p><pre><code>const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);</code></pre>', (SELECT user_id FROM public.profiles LIMIT 1), '00000000-0000-4000-8000-000000000001', 8, false, NOW() - INTERVAL '20 hours', NOW() - INTERVAL '20 hours'),

('00000000-0000-4000-8000-100000000003', '<p>Here''s my approach to PostgreSQL database design:</p><h3>Table Structure:</h3><ul><li>Follow 3NF for most cases</li><li>Denormalize only when performance demands it</li><li>Use meaningful naming conventions</li></ul><h3>Indexing Strategy:</h3><ul><li>Index foreign keys</li><li>Index columns used in WHERE clauses</li><li>Use composite indexes for multi-column queries</li></ul><p>Remember: indexes speed up reads but slow down writes!</p>', (SELECT user_id FROM public.profiles LIMIT 1), '00000000-0000-4000-8000-000000000002', 12, true, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

('00000000-0000-4000-8000-100000000004', '<p>Supabase authentication is quite straightforward! Here''s a complete setup:</p><h3>1. Basic Setup:</h3><pre><code>import { createClient } from "@supabase/supabase-js"

const supabase = createClient(url, anonKey)</code></pre><h3>2. Sign Up:</h3><pre><code>const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password"
})</code></pre><h3>3. Protecting Routes:</h3><p>Use React context or check user state before rendering protected components.</p>', (SELECT user_id FROM public.profiles LIMIT 1), '00000000-0000-4000-8000-000000000003', 22, true, NOW() - INTERVAL '23 hours', NOW() - INTERVAL '23 hours'),

('00000000-0000-4000-8000-100000000005', '<p>I''ve used both extensively. Here''s my recommendation:</p><h3>Choose Tailwind CSS if:</h3><ul><li>You want rapid prototyping</li><li>You prefer utility-first approach</li><li>Team members can learn the class system</li></ul><h3>Choose styled-components if:</h3><ul><li>You need dynamic styling based on props</li><li>You prefer component-scoped styles</li><li>You''re building a complex design system</li></ul><p>For most projects, I recommend Tailwind for its developer experience and performance.</p>', (SELECT user_id FROM public.profiles LIMIT 1), '00000000-0000-4000-8000-000000000004', 18, true, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours');

-- Update answer counts for questions
UPDATE public.questions SET answer_count = 3 WHERE id = '00000000-0000-4000-8000-000000000001';
UPDATE public.questions SET answer_count = 2 WHERE id = '00000000-0000-4000-8000-000000000002';
UPDATE public.questions SET answer_count = 4 WHERE id = '00000000-0000-4000-8000-000000000003';
UPDATE public.questions SET answer_count = 5 WHERE id = '00000000-0000-4000-8000-000000000004';
UPDATE public.questions SET answer_count = 2 WHERE id = '00000000-0000-4000-8000-000000000005';