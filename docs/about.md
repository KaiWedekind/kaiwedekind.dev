---
layout: page
title: About me
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
    title: 'Creator, Tech Enthusiast',
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
      About me
    </template>
    <template #lead>
      I'm a developer and avid tech enthusiast. I'm well-versed in the intricacies of software development, constantly exploring new technologies and staying at the forefront of industry trends.
I'm a dedicated advocate for continuous learning, always eager to expand my knowledge and explore the ever-evolving landscape of technology.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>