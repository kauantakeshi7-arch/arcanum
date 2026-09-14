// Supabase client bootstrap.
//
// A anon key é pública por design do Supabase — a segurança real vem do Row
// Level Security (RLS) das tabelas (ver ../../../supabase/schema.sql e
// migrations/), não do sigilo dessa chave. Nunca coloque a service_role key
// aqui ou em qualquer código de frontend.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltam VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copie .env.example para ' +
      '.env.local e preencha com os valores do seu projeto Supabase (Project Settings → API).',
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
