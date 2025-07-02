/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
    VITE_API_BASE_URL: string;
    VITE_TRUELAYER_CLIENT_ID: string;
    VITE_TRUELAYER_ENV: string;
  }
} 