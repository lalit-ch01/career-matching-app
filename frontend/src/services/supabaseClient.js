// Supabase client placeholder.
//
// This is NOT wired up to a real Supabase project yet — that happens in a
// later phase (see NEXT_PHASE.md). For now this file just shows the shape
// the real setup will take, using environment variables so no keys are
// ever hardcoded in the source code.
//
// Required env vars (see .env.example):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//
// IMPORTANT: only the public "anon" key belongs here. Never put the
// Supabase service-role key in frontend code.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Expected during the foundation stage — Supabase isn't set up yet.
  console.warn(
    '[supabaseClient] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set yet. ' +
      'This is expected at this stage — Supabase setup happens in a later phase.'
  )
}

export default supabase
