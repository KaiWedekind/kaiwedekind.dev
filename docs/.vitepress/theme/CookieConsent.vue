<script setup>
  import { ref, computed, watchEffect } from 'vue'
  import { useRoute } from 'vitepress';

  const route = useRoute();
  const locale = ref('en');
  const visible = ref('false');

  function getLocalStorage(key, defaultValue){
    const stickyValue = window.localStorage.getItem(key);

    return (stickyValue !== null && stickyValue !== 'undefined')
        ? JSON.parse(stickyValue)
        : defaultValue;
  }

  function setLocalStorage(key, value){
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function setCookieConsent(value) {
    setLocalStorage('cookie_consent', value);

    gtag('consent', 'update', {
      'analytics_storage': value
    });

    visible.value = !value;
  }

  watchEffect(() => {
    const storedCookieConsent = getLocalStorage('cookie_consent', null);

    visible.value = !storedCookieConsent;

    if (route.path.startsWith('/de/')) {
      locale.value = 'de';
    } else {
      locale.value = 'en';
    }
  });

  const text = computed(() => {
    switch(locale.value) {
      case 'de': {
        return 'Wir verwenden Cookies, um nützliche Funktionen anzubieten und die Leistung zu messen, um Ihre Erfahrung zu verbessern.'
      }
      case 'en': {
        return 'We use cookies to offer useful features and measure performance to improve your experience.'
      }
      default: {
        return 'We use cookies to offer useful features and measure performance to improve your experience.'
      }
    }
  });

  const acceptText = computed(() => {
    switch(locale.value) {
      case 'de': {
        return 'Akzeptieren'
      }
      case 'en': {
        return 'Accept'
      }
      default: {
        return 'Accept'
      }
    }
  });

  const declineText = computed(() => {
    switch(locale.value) {
      case 'de': {
        return 'Ablehnen'
      }
      case 'en': {
        return 'Decline'
      }
      default: {
        return 'Decline'
      }
    }
  });

  const learnMoreText = computed(() => {
    switch(locale.value) {
      case 'de': {
        return 'Mehr erfahren'
      }
      case 'en': {
        return 'Learn more'
      }
      default: {
        return 'Learn more'
      }
    }
  });
</script>

<template>
  <section v-if="visible" role="dialog" class="cookie-consent">
    <section class="cookie-consent-container">
      <span class="cookie-consent-message">
        {{ text }}
        <a role="button" href="https://www.cookiesandyou.com" target="_blank" class="cookie-consent-link">
          {{ learnMoreText }}
        </a>
      </span>
      <section class="cookie-consent-buttons">
        <button class="cookie-consent-button cookie-consent-decline-button" @click="setCookieConsent('denied')">{{ declineText }}</button>
        <button class="cookie-consent-button cookie-consent-accept-button" @click="setCookieConsent('granted')">{{ acceptText }}</button>
      </section>
    </section>
  </section>
</template>

<style lang="scss">
  @import './CookieConsent';
</style>
