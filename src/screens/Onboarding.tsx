import { useState, type FormEvent } from 'react';
import { getCursos, setConfig } from '../db/queries';
import { hashPin } from '../lib/auth';
import Logo from '../components/Logo';

export default function Onboarding(): JSX.Element {
  const cursos = getCursos();
  const [nombre, setNombre] = useState('');
  const [curso, setCurso] = useState(() => cursos[0]?.id ?? 'm1');
  const [pin, setPin] = useState('');
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
        <div className="onboarding-pasos">
          <div className="onboarding-paso">
            <span>1</span> Copia el prompt y estudia con tu IA
          </div>
          <div className="onboarding-paso">
            <span>2</span> Pega la evaluación que te dio
          </div>
          <div className="onboarding-paso">
            <span>3</span> Mira tu avance y repasa lo débil
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
