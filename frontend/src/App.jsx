import { Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Vehiculos from './pages/Vehiculos.jsx';
import Conductores from './pages/Conductores.jsx';
import Viajes from './pages/Viajes.jsx';

const Private = ({ children }) => (localStorage.getItem('token') ? children : <Navigate to="/login" replace />);

export default function App() {
  const nav = useNavigate();
  const logged = !!localStorage.getItem('token');
  const salir = () => { localStorage.removeItem('token'); nav('/login'); };

  return (
    <>
      <header className="barra">
        <NavLink to="/" className="marca">AfroBus</NavLink>
        <nav>
          {logged && <>
            <NavLink to="/vehiculos">Vehículos</NavLink>
            <NavLink to="/conductores">Conductores</NavLink>
            <NavLink to="/viajes">Viajes</NavLink>
          </>}
        </nav>
        {logged ? <button className="sec" onClick={salir}>Cerrar sesión</button> : <NavLink to="/login">Iniciar sesión</NavLink>}
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home logged={logged} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vehiculos" element={<Private><Vehiculos /></Private>} />
          <Route path="/conductores" element={<Private><Conductores /></Private>} />
          <Route path="/viajes" element={<Private><Viajes /></Private>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
