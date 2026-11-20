import { useState, type FormEvent } from 'react';
import { getCursos, setConfig } from '../db/queries';
import { hashPin } from '../lib/auth';
import { guardarClave } from '../lib/secureKey';
import Logo from '../components/Logo';
import { IconArrowLeft, IconArrowRight } from '../components/Icons';

interface OnboardingProps {
  onVolver?: () => void;
}

export default function Onboarding({ onVolver }: OnboardingProps): JSX.Element {
  const cursos = getCursos();
  const [nombre, setNombre] = useState('');
  const [curso, setCurso] = useState(() => cursos.find((c) => c.id === 'm1')?.id ?? cursos[0]?.id ?? 'm1');
  const [pin, setPin] = useState('');
  const [claveOR, setClaveOR] = useState('');
  const [error, setError] = useState('');

  async function empezar(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Escribe tu nombre para comenzar.');
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
        {onVolver ? (
          <button type="button" className="onboarding-volver" onClick={onVolver}>
            <IconArrowLeft size={15} />
            <span>Volver al inicio</span>
          </button>
        ) : null}

        <div className="onboarding-logo">
          <Logo size={56} />
        </div>
        <h1>Configura tu espacio de estudio</h1>
        <p className="onboarding-sub">
          Prepara tus <strong>Exámenes Libres del MINEDUC</strong> con orden y tranquilidad.
          Todo se guarda localmente en tu navegador, sin cuentas ni servidores.
        </p>

        <div className="onboarding-pasos">
          <div className="onboarding-paso">
            <span>01</span>
            <div>Estudia cada objetivo oficial paso a paso</div>
          </div>
          <div className="onboarding-paso">
            <span>02</span>
            <div>Practica con evaluaciones y ensayos reales</div>
          </div>
          <div className="onboarding-paso">
            <span>03</span>
            <div>Tu avance y respaldos viven en tu equipo</div>
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
            <small>
              {cursos.length} niveles oficiales disponibles (5° básico a 4° medio · temarios UCE MINEDUC).
            </small>
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
            <small>Permite activar el tutor IA directamente desde tu navegador.</small>
          </label>

          <label className="campo">
            <span>PIN para familias (opcional)</span>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Código de 4 a 6 dígitos"
              inputMode="numeric"
              maxLength={6}
            />
            <small>Protege localmente el panel de seguimiento y evaluaciones en Ajustes.</small>
          </label>

          {error ? <div className="error">{error}</div> : null}

          <button className="btn btn-primario" type="submit">
            <span>Empezar mi ruta</span>
            <IconArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
