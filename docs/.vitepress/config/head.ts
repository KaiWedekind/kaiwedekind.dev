const GoogleAnalyticsId = 'G-30Q0ZH1PYK';

export default [
  ['link', { rel: "apple-touch-icon", sizes: "180x180", href: "/assets/favicons/apple-touch-icon.png"}],
  ['link', { rel: "icon", type: "image/png", sizes: "32x32", href: "/assets/favicons/favicon-32x32.png"}],
  ['link', { rel: "icon", type: "image/png", sizes: "16x16", href: "/assets/favicons/favicon-16x16.png"}],
  ['link', { rel: "manifest", href: "/assets/favicons/site.webmanifest"}],
  ['link', { rel: "mask-icon", href: "/assets/favicons/safari-pinned-tab.svg", color: "#5bbad5"}],
  ['link', { rel: "shortcut icon", href: "/assets/favicons/favicon.ico"}],
  ['meta', { name: "msapplication-TileColor", content: "#5bbad5"}],
  ['meta', { name: "msapplication-config", content: "/assets/favicons/browserconfig.xml"}],
  ['meta', { name: "theme-color", content: "#1B1B1F"}],

  /* Buy Me A Coffee */
  [
    'script',
    {
      'data-name': 'BMC-Widget',
      'data-cfasync': 'false',
      'src': 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js',
      'data-id': 'kaiwedekind',
      'data-description': 'Support me on Buy me a coffee!',
      'data-message': '',
      'data-color': '#6324DF',
      'data-position': 'Right',
      'data-x_margin': '18',
      'data-y_margin': '18'
    }
  ],

  /* Google Analytics */
  [
    'script',
    {
      async: '',
      src: `https://www.googletagmanager.com/gtag/js?id=${GoogleAnalyticsId}`
    }
  ],
  [
    'script',
    {},
    `window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('consent', 'default', {
      'analytics_storage': 'denied'
    });

    gtag('config', '${GoogleAnalyticsId}', {
      anonymize_ip: true,
      page_path: window.location.pathname,
    });`
  ]
] as any;