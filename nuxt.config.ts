// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      charset: "utf-8",
      title: "OpenAI Key 查询",
      viewport: "width=device-width, initial-scale=1",
      meta: [{ name: "description", content: "OpenAI Key 查询" }],
    },
  },
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss"],
});
