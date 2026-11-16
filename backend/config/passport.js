import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import db from './db.js';

passport.use(new Strategy(
  { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET },
  async (payload, done) => {
    try {
      const [rows] = await db.query('SELECT id, nombre, email FROM usuarios WHERE id = ?', [payload.id]);
      done(null, rows[0] || false);
    } catch (e) { done(e, false); }
  }
));

export default passport;
