import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import codeSweeper from '@fe-fast/code-sweeper/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), codeSweeper()],
})
