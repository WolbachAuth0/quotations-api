const express = require('express');
const router = express.Router();
const controller = require('../controllers/quotations');
const { verifyJWT } = require('../middleware/auth');
const validate = require('./../middleware/schemaValidator');

module.exports = router

router
  .route('/')
  // .all(verifyJWT)
  .get(
    controller.search
  )
  .post(
    validate.requestBody(controller.schemas.quotation),
    controller.create
  )

router
  .route('/random')
  // .all(verifyJWT)
  .get(
    controller.getRandom
  )

router
  .route('/:quotation_id')
  // .all(verifyJWT)
  .get(
    controller.getById
  )
  .patch(
    validate.requestBody(controller.schemas.quotation),
    controller.update
  )
  .delete(
    controller.remove
  )
