// Supabase client bootstrap.
//
// The anon key below is meant to be public — Supabase's security model
// protects data via Row Level Security policies (see supabase/schema.sql),
// not by keeping the anon key secret. It is safe to commit config.js.
// Never put your service_role key anywhere in frontend code or this repo.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

if (SUPABASE_URL.includes('SEU-PROJETO') || SUPABASE_ANON_KEY.includes('SUA-CHAVE')) {
  console.warn(
    '[Arcanum] config.js ainda tem valores de exemplo. ' +
    'Edite config.js com a URL e a anon key do seu projeto Supabase (Project Settings → API).'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
