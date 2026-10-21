/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Optional absolute base URL for static media (images/sounds/fonts), e.g. a
   * Cloudflare R2 bucket or a CDN in front of one. Leave unset to keep every
   * asset bundled by Vite — see `src/lib/assets.ts`.
   */
  readonly VITE_ASSET_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
