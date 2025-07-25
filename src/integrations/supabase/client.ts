// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gwpujxdruldomwmuagzq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3cHVqeGRydWxkb213bXVhZ3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDM3MTEsImV4cCI6MjA2Nzg3OTcxMX0.KqcYt1CL7hk2SNH7AcT439P5eKvPZZI1umxXe64wClQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});