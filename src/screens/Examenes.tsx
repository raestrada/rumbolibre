import { EXAMENES_PDF, EJEMPLOS_PREGUNTA } from '../data/ejemplos';
import { Chip } from '../components/ui';

export default function Examenes(): JSX.Element {
  return (
    <div className="pantalla">
      <header className="cabecera">
        <h1>Exámenes reales 📄</h1>
        <p className="cabecera-sub">
          Preguntas de ejemplo <strong>oficiales del MINEDUC</strong> (Nivel Medio 1). Sirven para ver el
          formato real: opción múltiple, verdadero/falso y respuesta corta.
        </p>
      </header>

      <div className="banner banner-info">
        ℹ️ Para menores de 18 el MINEDUC publica solo temarios. Estas son las preguntas de ejemplo oficiales
        de la modalidad adultos (equivalente a 1° y 2° medio): mismo formato y temas.
      </div>

      <div className="lista">
        {EXAMENES_PDF.map((ex) => {
          const ej = EJEMPLOS_PREGUNTA[ex.asignatura];
          return (
            <section key={ex.id} className="tarjeta">
              <div className="examen-cabecera">
                <div className="examen-titulo">
                  <h3>{ex.nombre}</h3>
                  <span className="fila-sub">Preguntas de ejemplo · formato real</span>
                </div>
                <div className="examen-acciones">
                  <a className="btn btn-primario" href={ex.archivo} target="_blank" rel="noopener">
                    📄 Ver PDF
                  </a>
                  <a className="btn btn-suave" href={ex.archivo} download>
                    ⬇️ Descargar
                  </a>
                </div>
              </div>

              {ej ? (
                <div className="ejemplo-pregunta">
                  <div className="ejemplo-etiqueta">
                    <Chip tono="suave">Ejemplo real</Chip>
                  </div>
                  {ej.contexto ? <p className="ejemplo-contexto">{ej.contexto}</p> : null}
                  <p className="ejemplo-enunciado">{ej.enunciado}</p>
                  <div className="ejemplo-opciones">
                    {ej.alternativas.map((a, i) => (
                      <div key={i} className="ejemplo-opcion">
                        <strong>{String.fromCharCode(65 + i)}.</strong> {a}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <p className="cabecera-sub" style={{ marginTop: 16 }}>
        Fuente: portal de Validación de Estudios del MINEDUC (epja.mineduc.cl → Material de apoyo para la
        examinación → Preguntas de ejemplo, Nivel Medio 1).
      </p>
    </div>
  );
}
