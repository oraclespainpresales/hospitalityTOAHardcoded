var path = require('path');

module.exports = {
  server: {
    port: 19993,
    securePort: 19994,
    cookieSecret: 'etadirect-tools',
    distFolder:  __dirname,
    staticUrl: __dirname,
  	ip: '0.0.0.0',
  }
};
