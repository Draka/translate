/**
 * IMPORTANTE, USE SUS VARIABLES DE ENTORNO PARA CONFIGURAR
 * NO SUBA NADA AL REPO
 */

const enviroment = {
  v: '1.0.000',
  db: process.env.MONGO_URL || 'mongodb://localhost/translate',
  dbPrefix: process.env.DB_PREFIX || '',
  keySecret: process.env.KEY_SECRET || 'key',
  log: process.env.LOG || 'dev',
  url: {
    api: process.env.URL_API || 'http://localhost:3100/v1/', // url del sitio
  },
  gtm: process.env.GTM || '',
};

module.exports = enviroment;
