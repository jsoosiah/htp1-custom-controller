module.exports = {
  productionSourceMap: false,
  // publicPath: process.env.NODE_ENV === 'production'
    // ? '/custom/'
    // : '/'
  configureWebpack: config => {
    config.externals = {
      moment: 'moment'
    };
  }
};