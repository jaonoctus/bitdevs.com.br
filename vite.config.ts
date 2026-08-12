import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // The site is served from the root of bitdevs.com.br (the custom domain lives
  // in the repo's Pages setting, not a CNAME file), so '/' is correct for dev,
  // preview and the deployed build alike. BASE_PATH is the escape hatch if it
  // ever has to ship under a subpath again.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
})
