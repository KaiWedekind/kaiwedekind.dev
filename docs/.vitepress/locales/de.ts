export default {
  label: 'German',
  lang: 'de',
  link: '/de/',
  themeConfig: {
    nav: [
      { text: 'Startseite', link: '/de/' },
      { text: 'Über mich', link: '/de/about' }
    ],
    sidebar: [
      {
        text: 'Virtualisierung',
        collapsed: true,
        items: [
          { text: 'Erste Schritte', link: '/de/blog/virtualization/getting-started/' },
          { text: 'LXD', link: '/de/blog/virtualization/lxd/' },
          { text: 'Multipass', link: '/de/blog/virtualization/multipass/' },
          { text: 'Firecracker', link: '/de/blog/virtualization/firecracker/' }
        ]
      },
      {
        text: 'Kubernetes',
        collapsed: true,
        items: [
          { text: 'Erste Schritte', link: '/de/blog/kubernetes/getting-started/' },
          { text: 'RKE2', link: '/de/blog/kubernetes/rke2/' },
          { text: 'K3s', link: '/de/blog/kubernetes/k3s/' },
          { text: 'kubeadm', link: '/de/blog/kubernetes/kubeadm/' },
          { text: 'minikube', link: '/de/blog/kubernetes/minikube/' },
        ]
      },
      {
        text: 'Linux',
        collapsed: true,
        items: [
          { text: 'Erste Schritte', link: '/de/blog/linux/getting-started/' },
          { text: 'Ubuntu', link: '/de/blog/linux/ubuntu/' },
          { text: 'Raspberry Pi', link: '/de/blog/linux/raspberrypi/' },
        ]
      },
      {
        text: 'Cloud Computing',
        collapsed: true,
        items: [
          { text: 'Erste Schritte', link: '/de/blog/cloud-computing/getting-started/' },
        ]
      },
      {
        text: 'DevSecOps',
        collapsed: true,
        items: [
          { text: 'Erste Schritte', link: '/de/blog/devsecops/getting-started/' },
        ]
      },
      {
        text: 'Künstliche Intelligenz',
        collapsed: true,
        items: [
          { text: 'Erste Schritte', link: '/de/blog/ai/getting-started/' },
        ]
      },
      {
        text: 'Code Beispiele',
        collapsed: true,
        items: [
          { text: 'Übersicht', link: '/de/code-examples/' },
        ]
      },
      {
        text: 'About me',
        link: '/about'
      }
    ]
  }
}