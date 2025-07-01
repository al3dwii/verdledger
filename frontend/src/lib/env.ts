/**
 * Central place for environment constants.
 * Use NEXT_PUBLIC_API_URL in prod; fall back to local Fastify.
 */
export const API =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
