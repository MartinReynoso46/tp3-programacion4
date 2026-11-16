import passport from '../config/passport.js';

// Verifica el JWT con Passport y protege la ruta
export default (req, res, next) =>
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: 'Token inválido, vencido o ausente' });
    req.user = user;
    next();
  })(req, res, next);
