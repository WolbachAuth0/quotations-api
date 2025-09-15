const express = require('express');
const router = express.Router();
const controller = require('../controllers/quotations');
const { verifyJWT, checkJWTPermissions } = require('../middleware/auth');
const validate = require('./../middleware/schemaValidator');

module.exports = router

router
  .route('/')
  .all(verifyJWT)
  .get(
    checkJWTPermissions(['read:quotation']),
    controller.search
  )
  .post(
    checkJWTPermissions(['create:quotation']),
    validate.requestBody(controller.schemas.quotation),
    controller.create
  )

router
  .route('/random')
  .all(verifyJWT)
  .get(
    controller.getRandom
  )

router
  .route('/:quotation_id')
  .all(verifyJWT)
  .get(
    checkJWTPermissions(['read:quotation']),
    controller.getById
  )
  .patch(
    checkJWTPermissions(['update:quotation']),
    validate.requestBody(controller.schemas.quotation),
    controller.update
  )
  .delete(
    checkJWTPermissions(['delete:quotation']),
    controller.remove
  )
