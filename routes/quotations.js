const express = require('express');
const router = express.Router();
const controller = require('../controllers/quotations');
const { verifyJWT, checkJWTScopes } = require('../middleware/auth');
const validate = require('./../middleware/schemaValidator');

const options = {
    customScopeKey: 'scope',
    customUserKey: 'auth',
    failWithError: true
  }

module.exports = router

router
  .route('/')
  .all(verifyJWT)
  .get(
    checkJWTScopes(['read:quotations'], options),
    controller.search
  )
  .post(
    checkJWTScopes(['create:quotations'], options),
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
    // checkJWTScopes(['read:quotations'], options),
    controller.getById
  )
  .patch(
    checkJWTScopes(['update:quotations'], options),
    validate.requestBody(controller.schemas.quotation),
    controller.update
  )
  .delete(
    checkJWTScopes(['delete:quotations'], options),
    controller.remove
  )
