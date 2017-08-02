var path = require('path');

module.exports = {
  server: {
    port: 19999,  
    securePort: 19990,                                 
    cookieSecret: 'etadirect-tools',
    distFolder:  __dirname,
    staticUrl: __dirname, 
  	ip: '0.0.0.0',
  }
};
