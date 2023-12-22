const express = require('express');
const router = express.Router();


router.route('/').get(async (req, res, next) => {
  const av = req._av;
  try {
    await av.getVersion();
    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
});
module.exports = router;