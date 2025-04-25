const { initializeApp } = require('./index');

if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}
