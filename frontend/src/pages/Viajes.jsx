import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { REGEX_SOLO_LETRAS, soloLetras, soloNumeroNoNegativo, bloquearNegativos } from '../validaciones.js';

const vacio = {
  vehiculo_id: '', conductor_id: '', fecha_salida: '', fecha_llegada: '',
  origen: '', destino: '', kilometros: '', observaciones: '',
};

export default function Viajes() {
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [filtroVehiculo, setFiltroVehiculo] = useState('');
  const [filtroConductor, setFiltroConductor] = useState('');
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');

  // vehículos y conductores para los select
  useEffect(() => {
    api('/vehiculos').then(setVehiculos).catch((e) => setMensaje(e.message));
    api('/conductores').then(setConductores).catch((e) => setMensaje(e.message));
  }, []);

  // cada vez que cambia un filtro se vuelve a pedir el historial
  useEffect(() => {
    cargar();
  }, [filtroVehiculo, filtroConductor]);

  const cargar = async () => {
    let url = '/viajes?';
    if (filtroVehiculo) url += 'vehiculo_id=' + filtroVehiculo + '&';
    if (filtroConductor) url += 'conductor_id=' + filtroConductor;
    try {
      const data = await api(url);
      setViajes(data);
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const totalKm = viajes.reduce((suma, v) => suma + Number(v.kilometros), 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nuevo = value;
    if (name === 'origen' || name === 'destino') nuevo = soloLetras(value);
    if (name === 'kilometros') nuevo = soloNumeroNoNegativo(value);
    setForm({ ...form, [name]: nuevo });
  };

  const validar = () => {
    const e = {};
    if (!form.vehiculo_id) e.vehiculo_id = 'Elegí un vehículo';
    if (!form.conductor_id) e.conductor_id = 'Elegí un conductor';
    if (!form.fecha_salida) e.fecha_salida = 'La fecha de salida es obligatoria';
    if (!form.fecha_llegada) e.fecha_llegada = 'La fecha de llegada es obligatoria';
    else if (form.fecha_llegada < form.fecha_salida) e.fecha_llegada = 'No puede ser antes de la salida';
    if (!form.origen.trim()) e.origen = 'El origen es obligatorio';
    else if (!REGEX_SOLO_LETRAS.test(form.origen)) e.origen = 'El origen solo puede tener letras';
    if (!form.destino.trim()) e.destino = 'El destino es obligatorio';
    else if (!REGEX_SOLO_LETRAS.test(form.destino)) e.destino = 'El destino solo puede tener letras';
    if (form.kilometros === '') e.kilometros = 'Los kilómetros son obligatorios';
    else if (!(Number(form.kilometros) >= 0)) e.kilometros = 'No pueden ser negativos';
    return e;
  };

  const guardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    const e2 = validar();
    setErrores(e2);
    if (Object.keys(e2).length > 0) return;

    const body = {
      ...form,
      vehiculo_id: Number(form.vehiculo_id),
      conductor_id: Number(form.conductor_id),
      kilometros: Number(form.kilometros),
    };
    try {
      if (editandoId) {
        await api('/viajes/' + editandoId, { method: 'PUT', body });
        setMensaje('Viaje actualizado');
      } else {
        await api('/viajes', { method: 'POST', body });
        setMensaje('Viaje registrado');
      }
      cancelar();
      cargar();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const editar = (v) => {
    setEditandoId(v.id);
    setForm({ ...v, observaciones: v.observaciones || '' });
    setErrores({});
  };

  const cancelar = () => {
    setEditandoId(null);
    setForm(vacio);
    setErrores({});
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este viaje?')) return;
    try {
      await api('/viajes/' + id, { method: 'DELETE' });
      setMensaje('Viaje eliminado');
      cargar();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <>
      <h2>Viajes</h2>

      <div className="card filtros">
        <label>Historial por vehículo
          <select value={filtroVehiculo} onChange={(e) => setFiltroVehiculo(e.target.value)}>
            <option value="">Todos</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>{v.marca} {v.modelo} ({v.patente})</option>
            ))}
          </select>
        </label>
        <label>Historial por conductor
          <select value={filtroConductor} onChange={(e) => setFiltroConductor(e.target.value)}>
            <option value="">Todos</option>
            {conductores.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
            ))}
          </select>
        </label>
        <p className="total"><strong>{totalKm.toLocaleString('es-AR')} km</strong> en {viajes.length} viaje(s)</p>
      </div>

      <form className="card grid" onSubmit={guardar} noValidate>
        <label>Vehículo
          <select name="vehiculo_id" value={form.vehiculo_id} onChange={handleChange}>
            <option value="">Elegir...</option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>{v.marca} {v.modelo} ({v.patente})</option>
            ))}
          </select>
          {errores.vehiculo_id && <span className="error">{errores.vehiculo_id}</span>}
        </label>
        <label>Conductor
          <select name="conductor_id" value={form.conductor_id} onChange={handleChange}>
            <option value="">Elegir...</option>
            {conductores.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
            ))}
          </select>
          {errores.conductor_id && <span className="error">{errores.conductor_id}</span>}
        </label>
        <label>Fecha de salida
          <input type="date" name="fecha_salida" value={form.fecha_salida} onChange={handleChange} />
          {errores.fecha_salida && <span className="error">{errores.fecha_salida}</span>}
        </label>
        <label>Fecha de llegada
          <input type="date" name="fecha_llegada" value={form.fecha_llegada} onChange={handleChange} />
          {errores.fecha_llegada && <span className="error">{errores.fecha_llegada}</span>}
        </label>
        <label>Origen
          <input name="origen" value={form.origen} onChange={handleChange} maxLength={100} placeholder="Solo letras" />
          {errores.origen && <span className="error">{errores.origen}</span>}
        </label>
        <label>Destino
          <input name="destino" value={form.destino} onChange={handleChange} maxLength={100} placeholder="Solo letras" />
          {errores.destino && <span className="error">{errores.destino}</span>}
        </label>
        <label>Kilómetros
          <input type="number" name="kilometros" value={form.kilometros} onChange={handleChange}
            onKeyDown={bloquearNegativos} min="0" step="0.01" />
          {errores.kilometros && <span className="error">{errores.kilometros}</span>}
        </label>
        <label>Observaciones
          <input name="observaciones" value={form.observaciones} onChange={handleChange} />
        </label>
        <div className="acciones">
          <button className="btn">{editandoId ? 'Guardar cambios' : 'Registrar viaje'}</button>
          {editandoId && <button type="button" className="sec" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      {mensaje && <p className="aviso">{mensaje}</p>}

      <div className="tabla">
        <table>
          <thead>
            <tr>
              <th>Vehículo</th><th>Conductor</th><th>Salida</th><th>Llegada</th>
              <th>Origen</th><th>Destino</th><th>Km</th><th>Observaciones</th><th></th>
            </tr>
          </thead>
          <tbody>
            {viajes.map((v) => (
              <tr key={v.id}>
                <td>{v.vehiculo}</td>
                <td>{v.conductor}</td>
                <td>{v.fecha_salida}</td>
                <td>{v.fecha_llegada}</td>
                <td>{v.origen}</td>
                <td>{v.destino}</td>
                <td>{v.kilometros}</td>
                <td>{v.observaciones}</td>
                <td className="acciones">
                  <button className="sec" onClick={() => editar(v)}>Editar</button>
                  <button className="peligro" onClick={() => eliminar(v.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {viajes.length === 0 && <tr><td colSpan="9" className="vacio">No hay viajes para mostrar</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
