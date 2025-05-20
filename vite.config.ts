import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  root: 'demo',
  plugins: [
    tailwindcss(),
  ],
})