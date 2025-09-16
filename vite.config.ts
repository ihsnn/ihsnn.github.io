import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: '/htmlboy',
  // base: '/ihsnn.github.io',
  server: {
  host: true, // This will expose the server to the local network
},
})
