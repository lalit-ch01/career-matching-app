import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config for the React frontend.
// See: https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
