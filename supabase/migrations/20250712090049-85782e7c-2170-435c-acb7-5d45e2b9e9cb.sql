-- Insert dummy profiles for testing
INSERT INTO public.profiles (user_id, username, avatar_url, reputation, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'alice_dev', 'https://api.dicebear.com/7.x/personas/svg?seed=alice', 1250, 'user'),
('550e8400-e29b-41d4-a716-446655440002', 'bob_coder', 'https://api.dicebear.com/7.x/personas/svg?seed=bob', 890, 'user'),
('550e8400-e29b-41d4-a716-446655440003', 'charlie_tech', 'https://api.dicebear.com/7.x/personas/svg?seed=charlie', 2150, 'user'),
('550e8400-e29b-41d4-a716-446655440004', 'diana_code', 'https://api.dicebear.com/7.x/personas/svg?seed=diana', 3200, 'admin'),
('550e8400-e29b-41d4-a716-446655440005', 'eve_dev', 'https://api.dicebear.com/7.x/personas/svg?seed=eve', 750, 'user');

-- Insert dummy questions
INSERT INTO public.questions (id, title, description, tags, author_id, view_count, answer_count) VALUES 
('q1e8400-e29b-41d4-a716-446655440001', 'How to implement React hooks properly?', '<p>I''m trying to understand the best practices for using React hooks. Can someone explain the rules of hooks and provide some examples?</p><p>Here''s what I''ve tried so far:</p><pre><code>const [count, setCount] = useState(0);</code></pre>', '{"react", "hooks", "javascript"}', '550e8400-e29b-41d4-a716-446655440001', 125, 3),
('q2e8400-e29b-41d4-a716-446655440002', 'Database design for user authentication', '<p>What''s the best way to structure a database for user authentication? Should I store passwords in the same table as user profiles?</p><p>I''m considering these options:</p><ul><li>Single users table</li><li>Separate auth and profiles tables</li></ul>', '{"database", "authentication", "security"}', '550e8400-e29b-41d4-a716-446655440002', 89, 2),
('q3e8400-e29b-41d4-a716-446655440003', 'TypeScript vs JavaScript for large projects', '<p>We''re starting a new large-scale web application. Should we use TypeScript or stick with JavaScript?</p><p>Our team has experience with both, but we''re unsure about the trade-offs.</p>', '{"typescript", "javascript", "project-management"}', '550e8400-e29b-41d4-a716-446655440003', 156, 5),
('q4e8400-e29b-41d4-a716-446655440004', 'Optimizing SQL queries for better performance', '<p>My application is running slowly due to complex SQL queries. What are some general strategies for optimization?</p><p>Current query:</p><pre><code>SELECT * FROM users JOIN posts ON users.id = posts.user_id WHERE posts.created_at > ''2024-01-01''</code></pre>', '{"sql", "performance", "optimization"}', '550e8400-e29b-41d4-a716-446655440004', 203, 1),
('q5e8400-e29b-41d4-a716-446655440005', 'CSS Grid vs Flexbox: When to use which?', '<p>I''m confused about when to use CSS Grid versus Flexbox. Can someone explain the differences and provide some use cases?</p>', '{"css", "grid", "flexbox", "layout"}', '550e8400-e29b-41d4-a716-446655440005', 78, 0);

-- Insert dummy answers
INSERT INTO public.answers (id, content, author_id, question_id, vote_count, is_accepted) VALUES 
('a1e8400-e29b-41d4-a716-446655440001', '<p>Great question! Here are the main rules of hooks:</p><ol><li>Only call hooks at the top level</li><li>Only call hooks from React functions</li><li>Don''t call hooks inside loops, conditions, or nested functions</li></ol><p>Here''s a proper example:</p><pre><code>function MyComponent() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('''');
  
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);
  
  return <div>{count}</div>;
}</code></pre>', '550e8400-e29b-41d4-a716-446655440002', 'q1e8400-e29b-41d4-a716-446655440001', 15, true),
('a2e8400-e29b-41d4-a716-446655440002', '<p>I''d recommend using a custom hook for complex state management:</p><pre><code>function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);
  
  return { count, increment, decrement, reset };
}</code></pre>', '550e8400-e29b-41d4-a716-446655440003', 'q1e8400-e29b-41d4-a716-446655440001', 8, false),
('a3e8400-e29b-41d4-a716-446655440003', '<p>For database design, I strongly recommend separating authentication from user profiles:</p><ul><li><strong>auth table:</strong> email, password_hash, created_at, verified</li><li><strong>profiles table:</strong> user_id (FK), username, avatar_url, bio</li></ul><p>This separation provides better security and flexibility.</p>', '550e8400-e29b-41d4-a716-446655440004', 'q2e8400-e29b-41d4-a716-446655440002', 12, true),
('a4e8400-e29b-41d4-a716-446655440004', '<p>TypeScript is definitely worth it for large projects! The benefits include:</p><ul><li>Better IDE support</li><li>Catch errors at compile time</li><li>Self-documenting code</li><li>Easier refactoring</li></ul><p>The initial setup cost pays off quickly.</p>', '550e8400-e29b-41d4-a716-446655440001', 'q3e8400-e29b-41d4-a716-446655440003', 18, true);

-- Insert some votes
INSERT INTO public.votes (user_id, answer_id, vote_type) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'a1e8400-e29b-41d4-a716-446655440001', 'up'),
('550e8400-e29b-41d4-a716-446655440002', 'a1e8400-e29b-41d4-a716-446655440001', 'up'),
('550e8400-e29b-41d4-a716-446655440003', 'a1e8400-e29b-41d4-a716-446655440001', 'up'),
('550e8400-e29b-41d4-a716-446655440004', 'a2e8400-e29b-41d4-a716-446655440002', 'up'),
('550e8400-e29b-41d4-a716-446655440005', 'a3e8400-e29b-41d4-a716-446655440003', 'up'),
('550e8400-e29b-41d4-a716-446655440001', 'a4e8400-e29b-41d4-a716-446655440004', 'up');

-- Insert some badges
INSERT INTO public.badges (id, name, description, icon, tier, points_required) VALUES 
('badge-001', 'First Question', 'Asked your first question', '🔥', 'bronze', 0),
('badge-002', 'First Answer', 'Posted your first answer', '💡', 'bronze', 0),
('badge-003', 'Scholar', 'First accepted answer', '🎓', 'bronze', 0),
('badge-004', 'Popular Question', 'Question with 100+ views', '⭐', 'silver', 0),
('badge-005', 'Expert', '1000+ reputation points', '🏆', 'gold', 1000),
('badge-006', 'Helpul', '10+ upvoted answers', '🤝', 'silver', 0);

-- Award some badges to users
INSERT INTO public.user_badges (user_id, badge_id) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'badge-001'),
('550e8400-e29b-41d4-a716-446655440001', 'badge-002'),
('550e8400-e29b-41d4-a716-446655440002', 'badge-003'),
('550e8400-e29b-41d4-a716-446655440003', 'badge-001'),
('550e8400-e29b-41d4-a716-446655440004', 'badge-005'),
('550e8400-e29b-41d4-a716-446655440004', 'badge-004');