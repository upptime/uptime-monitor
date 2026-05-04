const config = require("@koj/config").releaseMaster;

module.exports = {
  ...config,
  plugins: config.plugins.map((plugin) => {
    const name = Array.isArray(plugin) ? plugin[0] : plugin;

    if (name === "@semantic-release/github") {
      return [
        "@semantic-release/github",
        {
          successComment: false,
          failComment: false,
          failTitle: false,
        },
      ];
    }

    if (name === "@semantic-release/npm") {
      return "@semantic-release/npm";
    }

    return plugin;
  }),
};
