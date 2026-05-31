// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Deployed to GitHub Pages at https://npgo22.github.io/ALI2ProposalDocs/
export default defineConfig({
  site: 'https://npgo22.github.io',
  base: '/ALI2ProposalDocs',
  integrations: [
    starlight({
      title: 'ALI-2 Instrumentation',
      description:
        'Design notes and component rationale for the APRL ALI-2 instrumentation and control monorepo.',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/npgo22/ALI2ProposalDocs',
        },
      ],
      sidebar: [
        { label: 'Overview', link: '/' },
        {
          label: 'Design Documents',
          items: [
            { slug: 'stm32cube-and-embassy' },
            { slug: 'firmware-design-analysis' },
            { slug: 'isolation' },
            { slug: 'fsm' },
            { slug: 'load-cell-log' },
          ],
        },
        {
          label: 'Components',
          autogenerate: { directory: 'components' },
        },
      ],
    }),
  ],
});
