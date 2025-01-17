import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  plugins: [react()]
  return {
    define: {
      __APP_ENV__: process.env.VITE_VERCEL_ENV,
    },
  };
});
