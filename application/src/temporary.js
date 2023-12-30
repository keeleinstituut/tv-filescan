require('dotenv').config()

const cors = require('cors');
const express = require('express');
const morgan = require('morgan');


const makeServer = async () => {
  const app = express();

  app.use(cors());
  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded({ extended: true }));

  app.use(morgan(process.env.APP_MORGAN_LOG_FORMAT || 'combined'))

  app.route('/healthz').get(async (req, res, next) => {
    res.json({
      success: true,
    });
  });

  app.all('*', (req, res, next) => {
    res.status(405).json({ success: false, data: { error: 'Not allowed.' } });
  });

  return app
}


const PORT = process.env.APP_PORT || 3000;

async function main() {
  try {
    const server = await makeServer()

    server.listen(PORT, () => {
      console.log(`Server started on PORT: ${PORT}`);
    });
  } catch (e) {
    console.log(e.message)
    throw e
  }
}

main()