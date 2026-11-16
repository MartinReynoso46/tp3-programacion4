import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from './config/passport.js';
import authRoutes from './routes/auth.js';
import vehiculos from './routes/vehiculos.js';
import conductores from './routes/conductores.js';
import viajes from './routes/viajes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/vehiculos', vehiculos);
app.use('/api/conductores', conductores);
app.use('/api/viajes', viajes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande' });
  if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Ya existe un registro con ese valor único (patente, documento, licencia o email)' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'El vehículo o conductor indicado no existe' });
  if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(403).json({ error: 'No se puede eliminar: tiene viajes asociados' });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(process.env.PORT || 3000, () => console.log('API en http://localhost:' + (process.env.PORT || 3000)));
