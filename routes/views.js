const express = require('express');
const router = express.Router();
const controller = require('../controllers/views');

module.exports = router;

router
  .route('/')
  .get(
    controller.quotations
  );

router
  .route('/quotation/:quotation_id')
  .get(
    controller.quoteById
  )

router
  .route('/author')
  .get(
    controller.author
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