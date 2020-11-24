module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      '@babel/preset-typescript',
      [
        '@babel/preset-env',
        {
          targets: {rhino: '1.7'},
        },
      ],
    ],
  };
};
