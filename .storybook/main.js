const webpackConfig = require('../webpack.config');

module.exports = {
    webpackFinal: (config) => {
        return { ...config, module: { ...config.module, rules: webpackConfig.module.rules } };
    },
    stories: ['../stories/**/decorator.js', '../stories/**/story.js']
};
