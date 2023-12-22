const { Router } = require('express')

const versionRouter = require('./version');
const scanRouter = require('./scan');
const dbSignaturesRouter = require('./dbsignatures');
const healthzRouter = require('./healthz');

const router = Router()

router.use('/api/v1/version', versionRouter);
router.use('/api/v1/scan', scanRouter);
router.use('/api/v1/dbsignatures', dbSignaturesRouter);
router.use('/healthz', healthzRouter);


module.exports = router