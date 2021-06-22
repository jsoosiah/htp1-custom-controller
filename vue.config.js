module.exports = {
  productionSourceMap: false,
  publicPath: process.env.VUE_APP_PUBLIC_PATH || '/',
  configureWebpack: config => {
    config.externals = {
      moment: 'moment'
    };
  }
};