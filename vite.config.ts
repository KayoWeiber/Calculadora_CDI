import { fileURLToPath } from 'node:url'
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
 
// https://vite.dev/config/
export default defineConfig({
  // Necessário para GitHub Pages em repositório de projeto
  // URL final: https://kayoweiber.github.io/Calculadora_CDI/
  base: '/Calculadora_CDI/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})