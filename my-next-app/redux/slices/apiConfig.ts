const rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://api.dsmelectro.com/api/v1';
export const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
