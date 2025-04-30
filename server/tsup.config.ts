import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/infra/http/server.ts'],
  clean: true,
  format: 'esm',
  outDir: 'dist',
})
