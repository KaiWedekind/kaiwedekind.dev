---
layout: page
title: Über mich
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: '/assets/images/profile.png',
    name: 'Kai Wedekind',
    title: 'Creator, Technikbegeisterter',
    links: [
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/kaiwedekind'},
      { icon: 'github', link: 'https://github.com/KaiWedekind' }
    ]
  }
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Über mich
    </template>
    <template #lead>
      Ich bin Entwickler und begeisterter Technikfan. Ich kenne mich gut mit den Feinheiten der Softwareentwicklung aus, erforsche ständig neue Technologien und bleibe an der Spitze der Branchentrends.
Ich bin ein engagierter Verfechter des kontinuierlichen Lernens, immer bestrebt, mein Wissen zu erweitern und die sich ständig weiterentwickelnde Technologielandschaft zu erkunden.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>