/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // ajoutez ici d'autres variables d'environnement que vous utilisez
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 