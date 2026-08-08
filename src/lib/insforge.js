import { createClient } from '@insforge/sdk';

const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_INSFORGE_URL)
  || (typeof process !== 'undefined' && process.env && process.env.VITE_INSFORGE_URL)
  || 'https://a7bstxui.us-west.insforge.app';

const anonKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_INSFORGE_ANON_KEY)
  || (typeof process !== 'undefined' && process.env && process.env.VITE_INSFORGE_ANON_KEY)
  || 'anon_7d6d4e8a4fce1b186920ba7806ba57773f4462c7bbbb3f630c40c1d4397ab470';

if (!baseUrl || !anonKey) {
  console.warn('InsForge configuration error: Base URL or Anon Key is missing.');
}

export const insforge = createClient({
  baseUrl,
  anonKey
});
