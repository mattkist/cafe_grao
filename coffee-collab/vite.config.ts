import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // troque NOME_DO_REPO pelo nome exato do seu repositório no GitHub
  base: '/cafe_grao/',
})