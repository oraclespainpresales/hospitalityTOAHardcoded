var path = require('path');

module.exports = {
  server: {
    port: 19091,
    securePort: 19092,                                 
    cookieSecret: 'etadirect-tools',
    distFolder:  __dirname,
    staticUrl: __dirname,
  	ip: '0.0.0.0',
  }
};
