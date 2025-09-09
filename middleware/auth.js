const checkJWTScopes = require('express-jwt-authz')
const { expressjwt: jwt } = require('express-jwt')
const jwks = require('jwks-rsa');


/**
 * Verify JWT issued via Authorization Code Flow w/PKCE to user
 * 
 * NOTES:
 * This expects the token issuer to be the custom domain.
 * 
 * The verifyJWT function writes the decoded access token to the req.user object
 */ 
const verifyJWT = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_CUSTOM_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUDIENCE,
  issuer: [ `https://${process.env.AUTH0_CUSTOM_DOMAIN}/`, `https://${process.env.AUTH0_DOMAIN}/` ],
  algorithms: ['RS256']
})

function checkJWTPermissions (permissions) {
  const options = {
    customScopeKey: 'permissions',
    customUserKey: 'auth',
    failWithError: true
  }
  return checkJWTScopes(permissions, options)
}


module.exports = {
  verifyJWT,
  checkJWTScopes,
  checkJWTPermissions
}