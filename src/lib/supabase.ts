import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gvfhdgushcouygbmlnzh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2ZmhkZ3VzaGNvdXlnYm1sbnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTMxMjYsImV4cCI6MjA4ODYyOTEyNn0.tz8iWA2TuXhNFB1M1GTcx4RWcuhAx3IYLdQ3eJJwmjQ';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
);
