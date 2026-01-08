import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import netlify from '@netlify/vite-plugin'

export default defineConfig({
  plugins: [react(), netlify()],
})
