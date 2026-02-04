import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Now/', // 이 줄을 반드시 추가해야 합니다!
})