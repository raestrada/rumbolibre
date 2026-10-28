# Política de Seguridad 🛡️

La privacidad y la seguridad de los estudiantes y sus familias es la máxima prioridad del proyecto **Rumbo Libre**.

## Arquitectura de Seguridad y Privacidad

- **100% Client-Side**: Rumbo Libre no opera servidores de base de datos ni recopila registros de navegación, telemetría o analíticas comerciales.
- **Base de datos local**: Todos los datos residen en la base de datos interna SQLite WASM (`sql.js`) persistida en el almacenamiento local `IndexedDB` del navegador del usuario.
- **PIN de Padres**: El PIN de control parental se guarda como un hash criptográfico **SHA-256** utilizando la API estándar del navegador (`crypto.subtle`). Nunca se almacena en texto claro.
- **Claves de API (OpenRouter)**: La clave de API para el tutor IA se almacena localmente y se envía de forma directa desde el navegador del usuario hacia los endpoints seguros de OpenRouter mediante HTTPS. Ningún tercero ni intermediario tiene acceso a dicha clave.
- **Saneamiento HTML**: El contenido generado por modelos de lenguaje se sanea rigurosamente mediante listas blancas antes de renderizarse en el DOM (ver `src/lib/sanitize.ts`).

## Reportar una Vulnerabilidad

Si descubres una posible vulnerabilidad de seguridad en Rumbo Libre, por favor repórtala de manera responsable:

1. **No abras un issue público** para vulnerabilidades críticas de seguridad.
2. Envía un correo electrónico privado a los mantenedores del repositorio a través del perfil oficial en GitHub o utiliza la función de **Advisory / Report a vulnerability** en GitHub Security.
3. Incluye:
   - Descripción detallada del problema.
   - Pasos para reproducirlo.
   - Posible impacto en la privacidad local o el navegador.

Agradecemos y reconocemos las contribuciones responsables de la comunidad de seguridad de software libre.
