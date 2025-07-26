import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server:{
    allowedHosts: true,
    host: "0.0.0.0",
    https: {
      key: fs.readFileSync('./key.pem'),
      cert: fs.readFileSync('./cert.pem'),
    },
  }
})
