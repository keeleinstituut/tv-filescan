const { Router } = require('express')

const versionRouter = require('./version');
const scanRouter = require('./scan');
const dbSignaturesRouter = require('./dbsignatures');

const router = Router()

router.use('/api/v1/version', versionRouter);
router.use('/api/v1/scan', scanRouter);
router.use('/api/v1/dbsignatures', dbSignaturesRouter);


module.exports = router