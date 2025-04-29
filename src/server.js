const { initializeApp } = require('./index');

// Don't initialize the app in test environments
if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
  initializeApp();
}
