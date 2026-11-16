import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import validate from '../middleware/validate.js';

const r = Router();
const sign = u => jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: '4h' });

const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'.-]+$/;

r.post('/register',
  body('nombre')
    .trim().notEmpty().withMessage('El nombre es obligatorio')
    .bail().isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres')
    .bail().matches(REGEX_SOLO_LETRAS).withMessage('El nombre solo puede contener letras'),
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  validate,
  async (req, res, next) => {
    try {
      const { nombre, email, password } = req.body;
      const [ya] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
      if (ya.length) return res.status(400).json({ error: 'El email ya está registrado' });
      const hash = await bcrypt.hash(password, 10);
      const [ins] = await db.query('INSERT INTO usuarios (nombre, email, password) VALUES (?,?,?)', [nombre, email, hash]);
      const user = { id: ins.insertId, nombre, email };
      res.status(201).json({ token: sign(user), user });
    } catch (e) { next(e); }
  });

r.post('/login',
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
      const u = rows[0];
      if (!u || !(await bcrypt.compare(password, u.password)))
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      res.json({ token: sign(u), user: { id: u.id, nombre: u.nombre, email: u.email } });
    } catch (e) { next(e); }
  });

export default r;
