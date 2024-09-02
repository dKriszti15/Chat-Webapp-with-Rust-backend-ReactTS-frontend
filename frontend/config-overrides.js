const webpack = require('webpack');
module.exports = function override(config, env){
    config.resolve.fallback = {
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
        crypto: require.resolve("crypto-browserify"),
        vm: require.resolve("vm-browserify"),
        buffer: require.resolve('buffer')
    };
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'buffer'],
        }),
    )
    config.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      });
    return config;
}