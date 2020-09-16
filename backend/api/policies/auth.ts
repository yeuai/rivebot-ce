import jwt, { SecretCallback } from 'express-jwt';
import { getDebugLogger } from '@kites/core/logger';
import { Request } from '@kites/express';

const logger = getDebugLogger('Auth');

/**
 * Get secret default from config or db
 * @param req - The express request object
 * @param payload - An object with the JWT claims
 * @param done - A function with signature function(err, secret) to be invoked when the secret is retrieved
 */
// tslint:disable-next-line: ban-types
function secretCallback(req: Request, payload: any, done: Function) {
  const kites = req.kites;
  done(null, kites.options.jwtSecret);
}

/**
 * Get token from
 * - headers
 * - query
 * - cookies
 * @param req
 */
function fromHeaderOrQuerystring(req: Request) {
  const { headers: { authorization } } = req;

  if (authorization && authorization.split(' ')[0] === 'Bearer') {
    logger.debug('Get token from header: ', authorization);
    return authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    logger.debug('Get token from query: ', req.query.token);
    return req.query.token;
  } else if (req.cookies && req.cookies.token) {
    logger.debug('Get token from query: ', req.query.token);
    return req.cookies.token;
  }
  return null;
}

export class AuthJwt {
  static required() {
    return jwt({
      secret: secretCallback,
      // userProperty: 'payload',
      getToken: fromHeaderOrQuerystring,
      algorithms: ['RS256'],
    });
  }

  static optional() {
    return jwt({
      secret: secretCallback,
      // userProperty: 'payload',
      getToken: fromHeaderOrQuerystring,
      credentialsRequired: false,
      algorithms: ['RS256'],
    });
  }
}
