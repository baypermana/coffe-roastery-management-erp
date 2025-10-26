import { createClient } from '@supabase/supabase-js';

// Membaca variabel lingkungan
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pengecekan Kritis: Inilah yang menyebabkan crash.
// Kita akan membiarkan pengecekan ini, karena ini adalah praktik yang baik.
if (!supabaseUrl || !supabaseAnonKey) {
  // Pesan error yang Anda lihat
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel Environment Settings.');
}

// Inisialisasi Klien Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
