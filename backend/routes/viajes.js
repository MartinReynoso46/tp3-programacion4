import { Router } from 'express';
import { body, param, query } from 'express-validator';
import db from '../config/db.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

const validarId = param('id').isInt({ min: 1 }).withMessage('El id tiene que ser un número');

const REGEX_SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'.-]+$/;

const validarViaje = [
  body('vehiculo_id').isInt({ min: 1 }).withMessage('Tenés que elegir un vehículo'),
  body('conductor_id').isInt({ min: 1 }).withMessage('Tenés que elegir un conductor'),
  body('fecha_salida').isISO8601().withMessage('Fecha de salida inválida'),
  body('fecha_llegada')
    .isISO8601().withMessage('Fecha de llegada inválida')
    .custom((valor, { req }) => valor >= req.body.fecha_salida)
    .withMessage('La llegada no puede ser antes de la salida'),
  body('origen')
    .trim().notEmpty().withMessage('El origen es obligatorio')
    .bail().isLength({ max: 100 }).withMessage('El origen no puede superar los 100 caracteres')
    .bail().matches(REGEX_SOLO_LETRAS).withMessage('El origen solo puede contener letras'),
  body('destino')
    .trim().notEmpty().withMessage('El destino es obligatorio')
    .bail().isLength({ max: 100 }).withMessage('El destino no puede superar los 100 caracteres')
    .bail().matches(REGEX_SOLO_LETRAS).withMessage('El destino solo puede contener letras'),
  body('kilometros').isFloat({ min: 0 }).withMessage('Los kilómetros no pueden ser negativos'),
  body('observaciones').optional({ values: 'falsy' }).isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
];

// historial: se puede filtrar por vehiculo_id y/o conductor_id
router.get('/',
  auth,
  query('vehiculo_id').optional().isInt({ min: 1 }).withMessage('vehiculo_id inválido'),
  query('conductor_id').optional().isInt({ min: 1 }).withMessage('conductor_id inválido'),
  validate,
  async (req, res, next) => {
    try {
      let sql = `SELECT v.*, CONCAT(ve.marca, ' ', ve.modelo, ' (', ve.patente, ')') AS vehiculo,
                 CONCAT(c.nombre, ' ', c.apellido) AS conductor
                 FROM viajes v
                 JOIN vehiculos ve ON ve.id = v.vehiculo_id
                 JOIN conductores c ON c.id = v.conductor_id
                 WHERE 1 = 1`;
      const params = [];
      if (req.query.vehiculo_id) {
        sql += ' AND v.vehiculo_id = ?';
        params.push(req.query.vehiculo_id);
      }
      if (req.query.conductor_id) {
        sql += ' AND v.conductor_id = ?';
        params.push(req.query.conductor_id);
      }
      sql += ' ORDER BY v.fecha_salida DESC, v.id DESC';
      const [viajes] = await db.query(sql, params);
      res.json(viajes);
    } catch (error) {
      next(error);
    }
  });

router.get('/:id', auth, validarId, validate, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM viajes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Viaje no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', auth, validarViaje, validate, async (req, res, next) => {
  try {
    const { vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones } = req.body;
    const [result] = await db.query(
      `INSERT INTO viajes (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones || null]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Viaje registrado' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth, validarId, validarViaje, validate, async (req, res, next) => {
  try {
    const { vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones } = req.body;
    const [result] = await db.query(
      `UPDATE viajes SET vehiculo_id = ?, conductor_id = ?, fecha_salida = ?, fecha_llegada = ?,
       origen = ?, destino = ?, kilometros = ?, observaciones = ? WHERE id = ?`,
      [vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Viaje no encontrado' });
    res.json({ mensaje: 'Viaje actualizado' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth, validarId, validate, async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM viajes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Viaje no encontrado' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
