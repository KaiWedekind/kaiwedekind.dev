import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './variables.scss';

import CustomLayout from './CustomLayout.vue';
import CookieConsent from './CookieConsent.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CookieConsent', CookieConsent);
  },
  Layout: CustomLayout
} satisfies Theme
