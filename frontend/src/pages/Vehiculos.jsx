import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { REGEX_ALFANUMERICO, soloAlfanumerico, soloNumeroNoNegativo, bloquearNegativos } from '../validaciones.js';

const vacio = { marca: '', modelo: '', patente: '', anio: '', capacidad_carga: '' };

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const data = await api('/vehiculos');
      setVehiculos(data);
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nuevo = value;
    if (name === 'marca' || name === 'modelo') nuevo = soloAlfanumerico(value);
    if (name === 'patente') nuevo = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (name === 'anio') nuevo = soloNumeroNoNegativo(value).slice(0, 4);
    if (name === 'capacidad_carga') nuevo = soloNumeroNoNegativo(value);
    setForm({ ...form, [name]: nuevo });
  };

  const validar = () => {
    const e = {};
    if (!form.marca.trim()) e.marca = 'La marca es obligatoria';
    else if (!REGEX_ALFANUMERICO.test(form.marca)) e.marca = 'La marca contiene caracteres inválidos';
    if (!form.modelo.trim()) e.modelo = 'El modelo es obligatorio';
    else if (!REGEX_ALFANUMERICO.test(form.modelo)) e.modelo = 'El modelo contiene caracteres inválidos';
    if (!/^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/.test(form.patente)) e.patente = 'Patente inválida (ej: ABC123 o AB123CD)';
    const anio = Number(form.anio);
    if (!form.anio || !Number.isInteger(anio) || anio < 1950 || anio > new Date().getFullYear() + 1) e.anio = 'Año inválido';
    if (form.capacidad_carga === '') e.capacidad_carga = 'La capacidad de carga es obligatoria';
    else if (!(Number(form.capacidad_carga) >= 0)) e.capacidad_carga = 'No puede ser negativa';
    return e;
  };

  const guardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    const e2 = validar();
    setErrores(e2);
    if (Object.keys(e2).length > 0) return;

    const body = { ...form, anio: Number(form.anio), capacidad_carga: Number(form.capacidad_carga) };
    try {
      if (editandoId) {
        await api('/vehiculos/' + editandoId, { method: 'PUT', body });
        setMensaje('Vehículo actualizado');
      } else {
        await api('/vehiculos', { method: 'POST', body });
        setMensaje('Vehículo creado');
      }
      cancelar();
      cargar();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const editar = (v) => {
    setEditandoId(v.id);
    setForm(v);
    setErrores({});
  };

  const cancelar = () => {
    setEditandoId(null);
    setForm(vacio);
    setErrores({});
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este vehículo?')) return;
    try {
      await api('/vehiculos/' + id, { method: 'DELETE' });
      setMensaje('Vehículo eliminado');
      cargar();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <>
      <h2>Vehículos</h2>
      <form className="card grid" onSubmit={guardar} noValidate>
        <label>Marca
          <input name="marca" value={form.marca} onChange={handleChange} maxLength={60} />
          {errores.marca && <span className="error">{errores.marca}</span>}
        </label>
        <label>Modelo
          <input name="modelo" value={form.modelo} onChange={handleChange} maxLength={60} />
          {errores.modelo && <span className="error">{errores.modelo}</span>}
        </label>
        <label>Patente
          <input name="patente" value={form.patente} onChange={handleChange} maxLength={7} placeholder="ABC123 o AB123CD" />
          {errores.patente && <span className="error">{errores.patente}</span>}
        </label>
        <label>Año
          <input type="number" name="anio" value={form.anio} onChange={handleChange}
            onKeyDown={bloquearNegativos} min="1950" max={new Date().getFullYear() + 1} />
          {errores.anio && <span className="error">{errores.anio}</span>}
        </label>
        <label>Capacidad de carga (kg)
          <input type="number" name="capacidad_carga" value={form.capacidad_carga} onChange={handleChange}
            onKeyDown={bloquearNegativos} min="0" step="0.01" />
          {errores.capacidad_carga && <span className="error">{errores.capacidad_carga}</span>}
        </label>
        <div className="acciones">
          <button className="btn">{editandoId ? 'Guardar cambios' : 'Agregar'}</button>
          {editandoId && <button type="button" className="sec" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      {mensaje && <p className="aviso">{mensaje}</p>}

      <div className="tabla">
        <table>
          <thead>
            <tr><th>Marca</th><th>Modelo</th><th>Patente</th><th>Año</th><th>Capacidad (kg)</th><th></th></tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.id}>
                <td>{v.marca}</td>
                <td>{v.modelo}</td>
                <td>{v.patente}</td>
                <td>{v.anio}</td>
                <td>{v.capacidad_carga}</td>
                <td className="acciones">
                  <button className="sec" onClick={() => editar(v)}>Editar</button>
                  <button className="peligro" onClick={() => eliminar(v.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {vehiculos.length === 0 && <tr><td colSpan="6" className="vacio">Todavía no hay vehículos cargados</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
