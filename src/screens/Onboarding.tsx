import { useState, type FormEvent } from 'react';
import { setConfig } from '../db/queries';
import { hashPin } from '../lib/auth';
import Logo from '../components/Logo';

export default function Onboarding(): JSX.Element {
  const [nombre, setNombre] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  async function empezar(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Escribe tu nombre para empezar.');
      return;
    }
    setConfig('nombre', nombre.trim());
    if (pin.trim()) {
      setConfig('pin_hash', await hashPin(pin.trim()));
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding-tarjeta">
        <div className="onboarding-logo">
          <Logo size={72} />
        </div>
        <h1>¡Bienvenida a Rumbo Libre! 🧭</h1>
        <p className="onboarding-sub">
          Tu guía para preparar los <strong>exámenes libres de 1° medio</strong> (MINEDUC) con ayuda de tu
          agente de IA. Todo se guarda en este computador.
        </p>
        <form onSubmit={empezar} className="onboarding-form">
          <label className="campo">
            <span>¿Cómo te llamas?</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              autoFocus
            />
          </label>
          <label className="campo">
            <span>PIN para papás (opcional)</span>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Un código secreto de 4 a 6 dígitos"
              inputMode="numeric"
              maxLength={6}
            />
            <small>Lo usarán tus papás para ver el seguimiento.</small>
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="btn btn-primario" type="submit">
            ¡Empezar mi ruta! 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
