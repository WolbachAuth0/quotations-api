const express = require('express');
const router = express.Router();
const controller = require('../controllers/authors');
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
    checkJWTScopes(['read:authors'], options),
    controller.search
  )

router
  .route('/random')
  .all(verifyJWT)
  .get(
    controller.getRandom
  )

router
  .route('/:author_id')
  .all(verifyJWT)
  .get(
    // checkJWTScopes(['read:authors'], options),
    controller.getById
  )
  .patch(
    checkJWTScopes(['update:authors'], options),
    validate.requestBody(controller.schemas.quotation),
    controller.update
  )
  // .delete(
  //   checkJWTScopes(['delete:authors'], options),
  //   controller.remove
  // )