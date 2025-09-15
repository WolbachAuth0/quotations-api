const express = require('express');
const router = express.Router();
const controller = require('../controllers/home');

router
  .route('/')
  .get(
    controller.home
  );

router
  .route('/docs')
  .get(
    controller.docs
  );

router
  .route('/health')
  .get(
    controller.health
  );

router
  .route('/openapi')
  .get(
    controller.specification
  );

// router
//   .route('/login')
//   .get(
//     controller.login
//   );

router
  .route('/oauth/token')
  .post(
    controller.token
  );
  
module.exports = router;