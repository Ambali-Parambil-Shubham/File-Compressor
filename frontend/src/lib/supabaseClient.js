import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://jatnudehgesskiuaflez.supabase.co';
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdG51ZGVoZ2Vzc2tpdWFmbGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTMwNTAsImV4cCI6MjA5MDUyOTA1MH0.JtpKgcEtFIpGZe5t4szQswFjGRA9DzR2k8Ju1xiFxuo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

const isConfigured =
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20;

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
