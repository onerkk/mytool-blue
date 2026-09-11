import { defineConfig } from 'vite';

// Browser QA for the existing static application; production still serves
// index.html and its classic scripts directly, without a framework migration.
export default defineConfig({
  server: { host: '0.0.0.0', allowedHosts: ['terminal.local'] },
  optimizeDeps: { noDiscovery: true }
});
