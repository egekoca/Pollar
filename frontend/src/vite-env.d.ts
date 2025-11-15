/// <reference types="vite/client" />

// Video file type declarations for Vite
declare module '*.mp4' {
  const src: string;
  export default src;
}
