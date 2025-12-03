import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,      // <--- Forces the app to run on 5176
    strictPort: true // <--- If 5176 is busy, it will fail instead of picking a random one
  }
})