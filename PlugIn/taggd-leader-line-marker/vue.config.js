module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /leader-line\/leader-line/,
          use: [
            {
              loader: 'skeleton-loader',
              options: {
                procedure: content => `${content} export default LeaderLine`
              }
            }
          ]
        }
      ]
    }
  }
};
