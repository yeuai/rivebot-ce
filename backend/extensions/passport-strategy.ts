import { KitesInstance } from '@kites/core';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { UserService } from '../api/features';

/**
 * Passport Strategy Configuration
 *
 * @param {kites} kites
 */
function ConfigPassportStrategy(kites: KitesInstance) {
  const svUser = kites.container.inject(UserService);
  kites.logger.info('Configure passport local strategy!');

  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
  }, (username, password, done) => {
    svUser.get(username)
      .then((user) => {
        if (!user) {
          return done(null, false, {
            message: 'username or password is incorrect',
          });
        } else if (!user.validatePassword(password)) {
          return done(null, false, {
            message: 'email or password is invalid',
          });
        } else {
          return done(null, user);
        }
      })
      .catch(done);
  }));

}

export {
  ConfigPassportStrategy,
};
