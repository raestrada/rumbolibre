import { useState } from 'react';
import { Modal } from './ui';

export default function OpenRouterInfo({
  texto = '¿Qué es OpenRouter?',
}: {
  texto?: string;
}): JSX.Element {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" className="link-info" onClick={() => setAbierto(true)}>
        {texto}
      </button>
      <Modal abierto={abierto} titulo="¿Qué es OpenRouter?" onCerrar={() => setAbierto(false)} ancho={640}>
        <div className="or-info">
          <p>
            <strong>OpenRouter</strong> es un servicio que te da <strong>una sola clave</strong> para usar
            muchos modelos de IA (Gemini, Claude, DeepSeek y más) y pagar solo lo que consumes.
          </p>
          <p>
            Con el <strong>modo directo</strong>, la app habla con el modelo desde tu navegador: mantiene el
            contexto, controla la cobertura de los temas y muestra las respuestas con el diseño de Rumbo Libre.
            Tu clave <strong>no pasa por servidores nuestros</strong>.
          </p>

          <h4>Cómo activarlo</h4>
          <ol className="or-pasos">
            <li>
              Crea una cuenta en{' '}
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">
                openrouter.ai
              </a>
              .
            </li>
            <li>
              En{' '}
              <a href="https://openrouter.ai/settings/credits" target="_blank" rel="noopener noreferrer">
                Créditos
              </a>
              , agrega un monto pequeño (ej. US$2–5).
            </li>
            <li>
              En{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
                Keys
              </a>
              , crea una clave y ponle un <strong>límite de gasto</strong>.
            </li>
            <li>
              Copia la clave (<code>sk-or-v1-…</code>) y pégala en <strong>Ajustes → Inteligencia artificial</strong>.
            </li>
          </ol>

          <div className="or-info-nota">
            🔐 La clave se guarda solo en este navegador. Usa el modo “solo en memoria” o “cifrada” y una clave
            con tope de gasto.
          </div>

          <div className="modal-acciones">
            <a className="btn btn-primario" href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer">
              Ir a OpenRouter →
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}
