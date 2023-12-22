import { defineConfig } from 'vitepress';
import en from './locales/en';
import de from './locales/de';

import head from './config/head';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/',
  title: "kaiwedekind.dev",
  description: "My blog",
  lang: 'en',
  themeConfig: en.themeConfig,
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    de: de
  },
  head: head
});
