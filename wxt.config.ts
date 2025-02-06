
import { defineConfig } from "wxt";
import { name, displayName, version, description } from './package.json'

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const matches = ['*://zhipin.com/*','*://*.zhipin.com/*'];

const EXT_USER_AGENT = JSON.stringify(`${displayName}/${version}`)

export default defineConfig({
    srcDir: 'src',
    modules: ['@wxt-dev/module-vue'],
    manifest: {
      permissions: ['scripting', 'webNavigation', 'storage','notifications'],
      web_accessible_resources: [
        {
          resources: ["main-world.js"],
          matches: matches,
        }
      ],
      host_permissions: matches,
    },
    imports:{

    },
    vite: () => ({
      define: {
        EXT_USER_AGENT,
      },
      ssr: {
        noExternal: [
          '@webext-core/storage',
          '@webext-core/messaging',
          '@webext-core/proxy-service',
        ],
      },
      plugins: [
        AutoImport({
          resolvers: [ElementPlusResolver()],
        }),
        Components({
          resolvers: [ElementPlusResolver()],
        }),
      ],
      css: {
        preprocessorOptions: {
          scss: {
            api: "modern-compiler", // or 'modern'
          },
        },
      },
    }),
    hooks: {
      'build:manifestGenerated': (wxt, manifest) => {
        manifest.content_scripts ??= [];
        manifest.content_scripts.push({
          // Build extension once to see where your CSS get's written to
          css: ["/assets/main-world.css"],
          matches: matches,
        });
      },
    },
  
});