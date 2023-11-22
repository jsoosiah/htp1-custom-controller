module.exports = {
  lintOnSave: 'warning',
  productionSourceMap: false,
  publicPath: process.env.VUE_APP_PUBLIC_PATH || '/',
  assetsDir: 'custom',
  configureWebpack: config => {
    config.externals = {
      moment: 'moment'
    };
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        appId: 'com.jsoosiah.htp1CustomUi',
        linux: {
          icon: 'icon.png',
          category: 'Utility',
        },
        mac: { icon: 'icon.png' },
        win: {
          icon: 'icon.ico',
        },
        snap: {
          publish: ['github'],
        },
        publish: {
          provider: 'github',
          repo: 'htp1-custom-controller',
          owner: 'jsoosiah',
        },
        extraResources: [
          {
            from: 'public',
            to: '.',
            filter: '**/*.ico',
          },
        ],
      },
    },
  },
};