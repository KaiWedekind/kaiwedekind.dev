export default {
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'About me', link: '/about' }
    ],
    sidebar: [
      {
        text: 'Virtualization',
        collapsed: true,
        items: [
          { text: 'Getting Started', link: '/blog/virtualization/getting-started/' },
          { text: 'LXD', link: '/blog/virtualization/lxd/' },
          { text: 'Multipass', link: '/blog/virtualization/multipass/' },
          { text: 'Firecracker', link: '/blog/virtualization/firecracker/' }
        ]
      },
      {
        text: 'Kubernetes',
        collapsed: true,
        items: [
          {
            text: 'Getting Started',
            link: '/blog/kubernetes/getting-started/'
          },
          {
            text: 'RKE2',
            collapsed: true,
            items: [
              {
                text: 'Overview',
                link: '/blog/kubernetes/rke2/'
              }, {
                text: 'Setup Multi Node RKE2 v1.29.0 cluster with Canonical Multipass',
                link: '/blog/kubernetes/rke2/setup-multi-node-rke2-v1.29.0-cluster-canonical-multipass'
              }
            ]
          },
          { text: 'K3s', link: '/blog/kubernetes/k3s/' },
          { text: 'kubeadm', link: '/blog/kubernetes/kubeadm/' },
          { text: 'minikube', link: '/blog/kubernetes/minikube/' },
        ]
      },
      {
        text: 'Linux',
        collapsed: true,
        items: [
          { text: 'Getting Started', link: '/blog/linux/getting-started/' },
          { text: 'Ubuntu', link: '/blog/linux/ubuntu/' },
          { text: 'Raspberry Pi', link: '/blog/linux/raspberrypi/' },
        ]
      },
      {
        text: 'Cloud Computing',
        collapsed: true,
        items: [
          { text: 'Getting Started', link: '/blog/cloud-computing/getting-started/' },
        ]
      },
      {
        text: 'DevSecOps',
        collapsed: true,
        items: [
          { text: 'Getting Started', link: '/blog/devsecops/getting-started/' },
        ]
      },
      {
        text: 'AI',
        collapsed: true,
        items: [
          { text: 'Getting Started', link: '/blog/ai/getting-started/' },
        ]
      },
      {
        text: 'Scripts',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/scripts/' },
        ]
      },
      {
        text: 'About me',
        link: '/about'
      }
    ]
  }
} as any