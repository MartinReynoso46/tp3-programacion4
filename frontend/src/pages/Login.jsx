import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { REGEX_SOLO_LETRAS, soloLetras } from '../validaciones.js';

export default function Login() {
  const nav = useNavigate();
  const [registro, setRegistro] = useState(false);
  const [f, setF] = useState({ nombre: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');

  const submit = async e => {
    e.preventDefault();
    const er = {};
    if (registro && !f.nombre.trim()) er.nombre = 'Obligatorio';
    else if (registro && !REGEX_SOLO_LETRAS.test(f.nombre)) er.nombre = 'El nombre solo puede tener letras';
    if (!f.email.trim()) er.email = 'Obligatorio';
    else if (!/^\S+@\S+\.\S+$/.test(f.email)) er.email = 'Email inválido';
    if (!f.password) er.password = 'Obligatorio';
    else if (registro && f.password.length < 6) er.password = 'Mínimo 6 caracteres';
    setErrors(er);
    if (Object.keys(er).length) return;
    try {
      const body = registro ? f : { email: f.email, password: f.password };
      const { token } = await api(registro ? '/auth/register' : '/auth/login', { method: 'POST', body });
      localStorage.setItem('token', token);
      nav('/vehiculos');
    } catch (err) { setMsg(err.message); }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    let nuevo = value;
    if (name === 'nombre') nuevo = soloLetras(value);
    if (name === 'email') nuevo = value.replace(/\s/g, '');
    setF({ ...f, [name]: nuevo });
  };

  const campo = (name, label, type = 'text') => {
    const autoComplete =
      name === 'password'
        ? (registro ? 'new-password' : 'current-password')
        : name === 'nombre' ? 'name' : 'email';
    return (
      <label>{label}
        <input
          type={type}
          name={name}
          autoComplete={autoComplete}
          value={f[name]}
          onChange={handleChange}
          maxLength={name === 'nombre' ? 100 : undefined}
        />
        {errors[name] && <span className="error">{errors[name]}</span>}
      </label>
    );
  };

  return (
    <form className="card login" onSubmit={submit} noValidate>
      <h2>{registro ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
      {registro && campo('nombre', 'Nombre')}
      {campo('email', 'Email', 'email')}
      {campo('password', 'Contraseña', 'password')}
      {msg && <p className="error">{msg}</p>}
      <button className="btn">{registro ? 'Registrarme' : 'Ingresar'}</button>
      <button type="button" className="link" onClick={() => { setRegistro(!registro); setErrors({}); setMsg(''); }}>
        {registro ? 'Ya tengo cuenta' : 'No tengo cuenta'}
      </button>
    </form>
  );
}
