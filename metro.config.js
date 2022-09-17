const exclusionList = require("metro-config/src/defaults/exclusionList");

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    blacklistRE: exclusionList([/#current-cloud-backend\/.*/]),
    sourceExts: ["jsx", "js", "ts", "tsx", "cjs"], //add here
  },
};
