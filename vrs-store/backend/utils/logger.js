const ts = () => new Date().toISOString().replace('T',' ').slice(0,19);

const logger = {
  info:  (...a) => console.log( `[${ts()}] INFO `,  ...a),
  warn:  (...a) => console.warn(`[${ts()}] WARN `,  ...a),
  error: (...a) => console.error(`[${ts()}] ERROR`, ...a),
  debug: (...a) => { if (process.env.NODE_ENV !== 'production') console.debug(`[${ts()}] DEBUG`, ...a); },
};

module.exports = logger;
