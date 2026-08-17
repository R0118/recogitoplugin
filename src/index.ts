import type { AstroIntegration } from 'astro';
import { Plugin, registerPlugin } from '@recogito/studio-sdk';

const ThesaurusPlugin: Plugin = {
  name: 'MN Thesaurus',
  module_name: 'mn-thesaurus-plugin',
  description: 'Tags from the MN thesaurus.',
  author: 'MN',
  homepage: 'https://thesaurus.mn.cenagis.edu.pl',
  thumbnail: 'thumbnail.jpg',
  extensions: [{
    name: 'mn-thesaurus-admin',
    component_name: 'AdminExtension',
    extension_point: 'admin'
  }, {
    name: 'mn-thesaurus-editor',
    component_name: 'EditorExtension',
    extension_point: 'annotation:*:annotation-editor'
  }]
};

const plugin = (): AstroIntegration => ({
  name: 'mn-thesaurus',
  hooks: {
    'astro:config:setup': ({config, logger, addAPI}) => {
      registerPlugin(ThesaurusPlugin, config, logger);

      logger.info('API: /api/mn-thesaurus/search');

      addAPI({
        pattern: '/api/mn-thesaurus/search',
        entrypoint: 'node_modules/mn-thesaurus-plugin/src/api/search.ts',
        prerender: false
      });
    }
  }
});

export default plugin;
