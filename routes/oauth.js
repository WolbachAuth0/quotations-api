const express = require('express');
const router = express.Router();
const controller = require('../controllers/oauth');

module.exports = router;

// router
//   .route('/login')
//   .get(
//     controller.login
//   );

router
  .route('/token')
  .post(
    controller.token
  );