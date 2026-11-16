import { useState, useEffect } from 'react';
import { api } from '../api.js';
import { REGEX_SOLO_LETRAS, soloLetras, soloDigitos } from '../validaciones.js';

const vacio = {
  nombre: '', apellido: '', numero_documento: '', numero_licencia: '',
  fecha_alta_licencia: '', fecha_vencimiento_licencia: '',
};

export default function Conductores() {
  const [conductores, setConductores] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const data = await api('/conductores');
      setConductores(data);
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nuevo = value;
    if (name === 'nombre' || name === 'apellido') nuevo = soloLetras(value);
    if (name === 'numero_documento') nuevo = soloDigitos(value).slice(0, 9);
    if (name === 'numero_licencia') nuevo = value.toUpperCase();
    setForm({ ...form, [name]: nuevo });
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    else if (!REGEX_SOLO_LETRAS.test(form.nombre)) e.nombre = 'El nombre solo puede tener letras';
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio';
    else if (!REGEX_SOLO_LETRAS.test(form.apellido)) e.apellido = 'El apellido solo puede tener letras';
    if (!/^\d{7,9}$/.test(form.numero_documento)) e.numero_documento = 'Documento inválido (de 7 a 9 números)';
    if (!form.numero_licencia.trim()) e.numero_licencia = 'El número de licencia es obligatorio';
    if (!form.fecha_alta_licencia) e.fecha_alta_licencia = 'La fecha de alta es obligatoria';
    if (!form.fecha_vencimiento_licencia) e.fecha_vencimiento_licencia = 'La fecha de vencimiento es obligatoria';
    else if (form.fecha_vencimiento_licencia <= form.fecha_alta_licencia) e.fecha_vencimiento_licencia = 'Tiene que ser posterior al alta';
    return e;
  };

  const guardar = async (e) => {
    e.preventDefault();
    setMensaje('');
    const e2 = validar();
    setErrores(e2);
    if (Object.keys(e2).length > 0) return;

    try {
      if (editandoId) {
        await api('/conductores/' + editandoId, { method: 'PUT', body: form });
        setMensaje('Conductor actualizado');
      } else {
        await api('/conductores', { method: 'POST', body: form });
        setMensaje('Conductor creado');
      }
      cancelar();
      cargar();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  const editar = (c) => {
    setEditandoId(c.id);
    setForm(c);
    setErrores({});
  };

  const cancelar = () => {
    setEditandoId(null);
    setForm(vacio);
    setErrores({});
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este conductor?')) return;
    try {
      await api('/conductores/' + id, { method: 'DELETE' });
      setMensaje('Conductor eliminado');
      cargar();
    } catch (error) {
      setMensaje(error.message);
    }
  };

  return (
    <>
      <h2>Conductores</h2>
      <form className="card grid" onSubmit={guardar} noValidate>
        <label>Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} maxLength={60} placeholder="Solo letras" />
          {errores.nombre && <span className="error">{errores.nombre}</span>}
        </label>
        <label>Apellido
          <input name="apellido" value={form.apellido} onChange={handleChange} maxLength={60} placeholder="Solo letras" />
          {errores.apellido && <span className="error">{errores.apellido}</span>}
        </label>
        <label>N.º de documento
          <input name="numero_documento" value={form.numero_documento} onChange={handleChange}
            inputMode="numeric" maxLength={9} placeholder="Solo números (7 a 9)" />
          {errores.numero_documento && <span className="error">{errores.numero_documento}</span>}
        </label>
        <label>N.º de licencia
          <input name="numero_licencia" value={form.numero_licencia} onChange={handleChange} maxLength={20} />
          {errores.numero_licencia && <span className="error">{errores.numero_licencia}</span>}
        </label>
        <label>Alta de licencia
          <input type="date" name="fecha_alta_licencia" value={form.fecha_alta_licencia} onChange={handleChange} />
          {errores.fecha_alta_licencia && <span className="error">{errores.fecha_alta_licencia}</span>}
        </label>
        <label>Vencimiento de licencia
          <input type="date" name="fecha_vencimiento_licencia" value={form.fecha_vencimiento_licencia} onChange={handleChange} />
          {errores.fecha_vencimiento_licencia && <span className="error">{errores.fecha_vencimiento_licencia}</span>}
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
            <tr><th>Nombre</th><th>Apellido</th><th>Documento</th><th>Licencia</th><th>Alta</th><th>Vencimiento</th><th></th></tr>
          </thead>
          <tbody>
            {conductores.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.apellido}</td>
                <td>{c.numero_documento}</td>
                <td>{c.numero_licencia}</td>
                <td>{c.fecha_alta_licencia}</td>
                <td>{c.fecha_vencimiento_licencia}</td>
                <td className="acciones">
                  <button className="sec" onClick={() => editar(c)}>Editar</button>
                  <button className="peligro" onClick={() => eliminar(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {conductores.length === 0 && <tr><td colSpan="7" className="vacio">Todavía no hay conductores cargados</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
