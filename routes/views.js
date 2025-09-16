const express = require('express');
const router = express.Router();
const controller = require('../controllers/views');

module.exports = router;

router
  .route('/')
  .get(
    controller.home
  );

router
  .route('/quotation/:quotation_id')
  .get(
    controller.quoteById
  )

router
  .route('/docs')
  .get(
    controller.docs
  );

router
  .route('/openapi')
  .get(
    controller.specification
  );