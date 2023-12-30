const NodeClam = require('clamscan');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const router = require('./routes')
// const bodyParser = require('body-parser');

async function makeServer(cfg) {
  let clamscan;
  try {
    const newAvConfig = Object.assign({}, cfg.avConfig);
    clamscan = await new NodeClam().init(newAvConfig);
  } catch (error) {
    throw new Error(`Cannot initialize clamav object: ${error}`);
  }

  const app = express();

  app.use(cors());
  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    req._av = clamscan;
    next();
  });

  app.use(fileUpload({ ...cfg.fuConfig }));

  if (process.env.NODE_ENV !== 'test') {
      app.use(morgan(process.env.APP_MORGAN_LOG_FORMAT || 'combined'))
  }

  app.use(router)

  app.all('*', (req, res, next) => {
    res.status(405).json({ success: false, data: { error: 'Not allowed.' } });
  });

  return app
}

module.exports = { makeServer };