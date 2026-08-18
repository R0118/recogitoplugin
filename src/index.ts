import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { Plugin, registerPlugin } from '@recogito/studio-sdk';

const ThesaurusPlugin: Plugin = {
  name: 'Mare Nostrum Lab Thesaurus',
  module_name: 'mn-thesaurus-plugin',
  description: 'Tags from the Mare Nostrum Lab thesaurus.',
  author: 'Mare Nostrum Lab',
  homepage: 'https://thesaurus.mn.cenagis.edu.pl',
  thumbnail: 'thumbnail.jpg',
  extensions: [{
    name: 'mn-thesaurus-editor',
    component_name: 'ThesaurusEditorExtension',
    extension_point: 'annotation:*:annotation-editor'
  }]
};

const plugin = (): AstroIntegration => ({
  name: 'mn-thesaurus',
  hooks: {
    'astro:config:setup': ({ config, logger, injectRoute }) => {
      registerPlugin(ThesaurusPlugin, config, logger);

      logger.info('API: /api/mn-thesaurus/search');

      injectRoute({
        pattern: '/api/mn-thesaurus/search',
        entrypoint: fileURLToPath(new URL('../src/api/search.ts', import.meta.url))
      });
    }
  }
});

export default plugin;
