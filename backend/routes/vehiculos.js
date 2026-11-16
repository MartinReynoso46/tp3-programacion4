import { Router } from 'express';
import { body, param, query } from 'express-validator';
import db from '../config/db.js';
import auth from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

const validarId = param('id').isInt({ min: 1 }).withMessage('El id tiene que ser un número');

const REGEX_ALFANUMERICO = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\s'./-]+$/;

const validarVehiculo = [
  body('marca')
    .trim().notEmpty().withMessage('La marca es obligatoria')
    .bail().isLength({ max: 60 }).withMessage('La marca no puede superar los 60 caracteres')
    .bail().matches(REGEX_ALFANUMERICO).withMessage('La marca contiene caracteres inválidos'),
  body('modelo')
    .trim().notEmpty().withMessage('El modelo es obligatorio')
    .bail().isLength({ max: 60 }).withMessage('El modelo no puede superar los 60 caracteres')
    .bail().matches(REGEX_ALFANUMERICO).withMessage('El modelo contiene caracteres inválidos'),
  body('patente').trim().matches(/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/i).withMessage('Patente inválida (ej: ABC123 o AB123CD)'),
  body('anio').isInt({ min: 1950, max: new Date().getFullYear() + 1 }).withMessage('Año inválido'),
  body('capacidad_carga').isFloat({ min: 0 }).withMessage('La capacidad de carga no puede ser negativa'),
];

// traer todos (con búsqueda opcional por marca, modelo o patente)
router.get('/',
  auth,
  query('q').optional().trim().isLength({ min: 1, max: 100 }).withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
  validate,
  async (req, res, next) => {
    try {
      const busqueda = req.query.q;
      if (busqueda) {
        const like = `%${busqueda}%`;
        const [vehiculos] = await db.query(
          'SELECT * FROM vehiculos WHERE marca LIKE ? OR modelo LIKE ? OR patente LIKE ? ORDER BY id DESC',
          [like, like, like]
        );
        return res.json(vehiculos);
      }
      const [vehiculos] = await db.query('SELECT * FROM vehiculos ORDER BY id DESC');
      res.json(vehiculos);
    } catch (error) {
      next(error);
    }
  });

// traer uno
router.get('/:id', auth, validarId, validate, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM vehiculos WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// crear
router.post('/', auth, validarVehiculo, validate, async (req, res, next) => {
  try {
    const { marca, modelo, patente, anio, capacidad_carga } = req.body;
    const [result] = await db.query(
      'INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) VALUES (?, ?, ?, ?, ?)',
      [marca, modelo, patente.toUpperCase(), anio, capacidad_carga]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Vehículo creado' });
  } catch (error) {
    next(error);
  }
});

// modificar
router.put('/:id', auth, validarId, validarVehiculo, validate, async (req, res, next) => {
  try {
    const { marca, modelo, patente, anio, capacidad_carga } = req.body;
    const [result] = await db.query(
      'UPDATE vehiculos SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ? WHERE id = ?',
      [marca, modelo, patente.toUpperCase(), anio, capacidad_carga, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.json({ mensaje: 'Vehículo actualizado' });
  } catch (error) {
    next(error);
  }
});

// eliminar
router.delete('/:id', auth, validarId, validate, async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM vehiculos WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
