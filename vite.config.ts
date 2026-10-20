import { defineConfig } from 'vitest/config';
export default defineConfig({base: '/crypto-lab-prime-witness/', test:{include:['src/**/*.test.ts'], testTimeout:30000}});
