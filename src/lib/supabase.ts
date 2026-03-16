import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://txepthncsczlcjajqzwh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4ZXB0aG5jc2N6bGNqYWpxendoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NTEzNTMsImV4cCI6MjA4OTIyNzM1M30.YT3Mya6QkUudqXVmizfuFIAGtp_Ey9O8Y67JvMS14oU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
