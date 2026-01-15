/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_GEO_OFFLINE?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
