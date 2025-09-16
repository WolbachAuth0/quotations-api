const express = require('express');
const router = express.Router();
const controller = require('../controllers/errors');

module.exports = router;

router
  .route('/api/health')
  .get(
    controller.health
  );

router
  .route('/api/*')
  .all(
    controller.notFoundJSON
  )

router
  .route('*')
  .all(
    controller.notFoundView
  )