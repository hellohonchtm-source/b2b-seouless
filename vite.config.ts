import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Expose both VITE_ and NEXT_PUBLIC_ prefixed env vars to import.meta.env
  // so the Supabase client can read NEXT_PUBLIC_SUPABASE_URL etc.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
});
