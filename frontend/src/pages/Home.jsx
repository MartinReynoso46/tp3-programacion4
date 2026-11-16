import { Link } from 'react-router-dom';

export default function Home({ logged }) {
  return (
    <section className="hero">
      <h1>Cada viaje de tu AfroBus, en un solo lugar</h1>
      <p>Registrá vehículos y conductores, cargá los viajes y mirá cuántos kilómetros hizo cada uno.</p>
      {logged
        ? <Link className="btn" to="/viajes">Ir a los viajes</Link>
        : <Link className="btn" to="/login">Iniciar sesión</Link>}
    </section>
  );
}
