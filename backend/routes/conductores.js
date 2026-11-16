import { Router } from 'express';
import { body, param, query } from 'express-validator';
import db from '../config/db.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

const validarId = param('id').isInt({ min: 1 }).withMessage('El id tiene que ser un número');

const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'.-]+$/;

const validarConductor = [
  body('nombre')
    .trim().notEmpty().withMessage('El nombre es obligatorio')
    .bail().isLength({ max: 60 }).withMessage('El nombre no puede superar los 60 caracteres')
    .bail().matches(REGEX_SOLO_LETRAS).withMessage('El nombre solo puede contener letras'),
  body('apellido')
    .trim().notEmpty().withMessage('El apellido es obligatorio')
    .bail().isLength({ max: 60 }).withMessage('El apellido no puede superar los 60 caracteres')
    .bail().matches(REGEX_SOLO_LETRAS).withMessage('El apellido solo puede contener letras'),
  body('numero_documento').trim().matches(/^\d{7,9}$/).withMessage('Documento inválido (de 7 a 9 números)'),
  body('numero_licencia')
    .trim().notEmpty().withMessage('El número de licencia es obligatorio')
    .bail().isLength({ max: 20 }).withMessage('El número de licencia no puede superar los 20 caracteres'),
  body('fecha_alta_licencia').isISO8601().withMessage('Fecha de alta inválida'),
  body('fecha_vencimiento_licencia')
    .isISO8601().withMessage('Fecha de vencimiento inválida')
    .custom((valor, { req }) => valor > req.body.fecha_alta_licencia)
    .withMessage('El vencimiento tiene que ser posterior al alta'),
];

router.get('/',
  auth,
  query('q').optional().trim().isLength({ min: 1, max: 100 }).withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
  validate,
  async (req, res, next) => {
    try {
      const busqueda = req.query.q;
      if (busqueda) {
        const like = `%${busqueda}%`;
        const [conductores] = await db.query(
          `SELECT * FROM conductores
           WHERE nombre LIKE ? OR apellido LIKE ? OR numero_documento LIKE ? OR numero_licencia LIKE ?
           ORDER BY id DESC`,
          [like, like, like, like]
        );
        return res.json(conductores);
      }
      const [conductores] = await db.query('SELECT * FROM conductores ORDER BY id DESC');
      res.json(conductores);
    } catch (error) {
      next(error);
    }
  });

router.get('/:id', auth, validarId, validate, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM conductores WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Conductor no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', auth, validarConductor, validate, async (req, res, next) => {
  try {
    const { nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;
    const [result] = await db.query(
      `INSERT INTO conductores (nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Conductor creado' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth, validarId, validarConductor, validate, async (req, res, next) => {
  try {
    const { nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;
    const [result] = await db.query(
      `UPDATE conductores SET nombre = ?, apellido = ?, numero_documento = ?, numero_licencia = ?,
       fecha_alta_licencia = ?, fecha_vencimiento_licencia = ? WHERE id = ?`,
      [nombre, apellido, numero_documento, numero_licencia, fecha_alta_licencia, fecha_vencimiento_licencia, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Conductor no encontrado' });
    res.json({ mensaje: 'Conductor actualizado' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth, validarId, validate, async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM conductores WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Conductor no encontrado' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
