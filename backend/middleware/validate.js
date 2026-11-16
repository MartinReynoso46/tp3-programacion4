import { validationResult } from 'express-validator';

export default (req, res, next) => {
  const e = validationResult(req);
  if (e.isEmpty()) return next();
  res.status(400).json({ errores: e.array().map(x => ({ campo: x.path, mensaje: x.msg })) });
};
