module.exports = {
  apps: [
    {
      name: 'cat-ms-type-orm-dev',
      script: 'dist/main.js',
      autorestart: true,
      max_restarts: 10,
    },
  ],
};
