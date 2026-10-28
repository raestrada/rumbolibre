import { useState, type FormEvent } from 'react';
import { getCursos, setConfig } from '../db/queries';
import { hashPin } from '../lib/auth';
import { guardarClave } from '../lib/secureKey';
import Logo from '../components/Logo';

export default function Onboarding(): JSX.Element {
  const cursos = getCursos();
  const [nombre, setNombre] = useState('');
  const [curso, setCurso] = useState(() => cursos[0]?.id ?? 'm1');
  const [pin, setPin] = useState('');
  const [claveOR, setClaveOR] = useState('');
  const [error, setError] = useState('');

  async function empezar(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Escribe tu nombre para empezar.');
      return;
    }
    setConfig('nombre', nombre.trim());
    setConfig('curso_activo', curso);
    if (pin.trim()) {
      setConfig('pin_hash', await hashPin(pin.trim()));
    }
    if (claveOR.trim()) {
      try {
        await guardarClave(claveOR.trim(), 'sesion');
      } catch {
        /* ignore */
      }
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
          agente de IA. Todo se guarda directamente en este computador.
        </p>
        <div className="onboarding-pasos">
          <div className="onboarding-paso">
            <span>1</span> Tu profe IA te explica punto por punto
          </div>
          <div className="onboarding-paso">
            <span>2</span> Preguntas interactivas y calificación al instante
          </div>
          <div className="onboarding-paso">
            <span>3</span> Tu avance y repasos se guardan solos
          </div>
        </div>
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
            <span>Curso</span>
            <select value={curso} onChange={(e) => setCurso(e.target.value)}>
              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <small>Por ahora está disponible 1° medio.</small>
          </label>
          <label className="campo">
            <span>Clave de OpenRouter (opcional)</span>
            <input
              type="password"
              value={claveOR}
              onChange={(e) => setClaveOR(e.target.value)}
              placeholder="sk-or-v1-… (puedes agregarla después en Ajustes)"
              autoComplete="off"
            />
            <small>Permite que tu profe IA te enseñe y evalúe directamente en la app.</small>
          </label>
          <label className="campo">
            <span>PIN para papás (opcional)</span>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Código de 4 a 6 dígitos"
              inputMode="numeric"
              maxLength={6}
            />
            <small>Protege el seguimiento y las evaluaciones en la sección Ajustes.</small>
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
