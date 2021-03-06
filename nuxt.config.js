const pkg = require("./package");
module.exports = {
  mode: "universal",

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.title,
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: pkg.description },
      { property: "og:url", content: "https://trongame.top" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: pkg.title },
      { property: "og:image", content: "/images/share.png" },
      { property: "og:description", content: pkg.description },
      { name: "twitter:site", content: "https://trongame.top" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/images/logo.png" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },{rel:"stylesheet",href:"//at.alicdn.com/t/font_905800_0qi6hlgu8tz.css"},{rel:"stylesheet",href:"//at.alicdn.com/t/font_887145_qo7ihcn4u5.css"}],
    script: [{ src: "/js/rem.js" }]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: false,

  router: {
    middleware: "i18n"
  },

  generate: {
    routes: ["/", "/ch", "/en",'/kor','/rus']
  },

  /*
  ** Global CSS
  */
  css: ["element-ui/lib/theme-chalk/index.css", "@/static/css/reset.css"],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: ["@/plugins/i18n.js", "@/plugins/element-ui", "@/plugins/filter.js"],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    "@nuxtjs/axios"
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  env: {
    BASE_API: "",
    ACTIVITY_API: "http://47.90.189.80:9080/api"
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.concat([
          {
            test: /\.sass$/,
            loaders: ["style", "css", "sass"]
          }
        ]);
      }
    }
  }
};
