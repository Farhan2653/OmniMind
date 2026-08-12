import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export const createSupabaseServerClient = (cookies: any) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        getAll() { return cookies.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookies.set(name, value, options)) } catch (e) {}
        },
    } }
  );
};
