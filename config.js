var path = require('path');

module.exports = {
  server: {
    port: 19991,
    securePort: 19992,
    cookieSecret: 'etadirect-tools',
    distFolder:  __dirname,
    staticUrl: __dirname,
  	ip: '0.0.0.0',
  }
};
