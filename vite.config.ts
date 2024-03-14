import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn } from "vite-plugin-monkey";
import process from "process";
import path from "path";

const pathSrc = path.resolve(__dirname, "src");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: "src/main.ts",
      userscript: {
        name: "Boss直聘助手",
        version: loadEnv("", process.cwd(), "").VITE_VERSION,
        license: "MIT",
        description:
          "优化UI去除广告,批量投递简历,高级筛选,GPT自动打招呼,多账号管理...",
        icon: "https://img.bosszhipin.com/beijin/mcs/banner/3e9d37e9effaa2b6daf43f3f03f7cb15cfcd208495d565ef66e7dff9f98764da.jpg",
        namespace: "https://github.com/Ocyss/boos-helper",
        homepage: "https://github.com/Ocyss/boos-helper",
        match: ["https://*.zhipin.com/*"],
        author: "Ocyss",
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr("Vue", "dist/vue.global.prod.js"),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": pathSrc,
    },
  },
});
