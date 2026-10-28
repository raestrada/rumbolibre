# Rumbo Libre 🧭

[![Deploy to GitHub Pages](https://github.com/raestrada/rumbolibre/actions/workflows/deploy.yml/badge.svg)](https://github.com/raestrada/rumbolibre/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Temario: MINEDUC Chile](https://img.shields.io/badge/Temario-MINEDUC%20Chile%201%C2%B0%20Medio-7c3aed.svg)](docs/01-temario-1medio.md)
[![Architecture: 100% Client--Side](https://img.shields.io/badge/Arquitectura-100%25%20Local%20(SQLite%20WASM)-10b981.svg)](docs/02-arquitectura.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)

> **Rumbo Libre** es una plataforma web libre, gratuita y **100% local** (sin servidor) diseñada para preparar los **Exámenes Libres de Validación de Estudios (menores de 18 años)** del Ministerio de Educación de Chile (**MINEDUC**). Nivel inicial: **1° medio**.

Disponible en línea vía GitHub Pages: **[https://raestrada.github.io/rumbolibre/](https://raestrada.github.io/rumbolibre/)**

---

## 🌟 Pilares Fundamentales

### 1. 🛡️ 100% Privado y Local First (SQLite en tu Navegador)
- Todos los datos, notas, bitácora de estudio, lecturas y claves se almacenan **exclusivamente dentro de tu navegador** mediante **SQLite compilado a WebAssembly (`sql.js`)** persistido en **IndexedDB**.
- **Sin backend, sin base de datos central, sin telemetría ni rastreo comercial**. Los datos del estudiante jamás salen de su computador.
- **Exportación e importación total**: Descarga tu base de datos completa como archivo `.sqlite` o `.json` con un clic para respaldar o transferir tu avance.

### 2. 🇨🇱 Alineación Estricta al Currículum Oficial del MINEDUC
- Contiene los **40 módulos oficiales** de 1° Medio en 6 asignaturas:
  - 📖 **Lengua y Literatura** (8 módulos)
  - 📐 **Matemática** (8 módulos)
  - 🔬 **Ciencias Naturales** (8 módulos: Biología, Física y Química)
  - 🏛️ **Historia, Geografía y Ciencias Sociales** (10 módulos)
  - 🌍 **Idioma Extranjero Inglés** (3 módulos)
  - 🗳️ **Educación Ciudadana** (3 módulos)
- **Política estricta de no-alucinación**: Cada Objetivo de Aprendizaje (OA), indicador de evaluación y criterio de profundización se extrajo directamente de los temarios oficiales del ministerio.

### 3. 🤖 Tutoría Inteligente y Determinística con IA
- Integración directa con **OpenRouter** (soporta modelos gratuitos y ultra-eficientes como DeepSeek V3, Claude, GPT, etc.).
- **Explicaciones paso a paso** con lenguaje empático y ejemplos cotidianos de la realidad chilena.
- **Validación determinística de cobertura**: El sistema valida que cada punto esté cubierto según el estándar oficial del MINEDUC antes de evaluarlo.
- **Evaluaciones interactivas estilo prueba oficial**: Selección múltiple, análisis de caso y verdadero/falso con retroalimentación instantánea y explicativa.

### 4. 👨‍👩‍👧 Espacio Protegido para Familias y Homeschooling
- Supervisión con **PIN para padres cifrado en SHA-256** (WebCrypto).
- Bitácora de estudio, métricas de avance por asignatura y seguimiento de lecturas recomendadas.

---

## 🏗️ Arquitectura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVEGADOR DEL USUARIO                   │
│                                                             │
│  ┌────────────────────────┐     ┌────────────────────────┐  │
│  │   UI (React + TS)      │     │  SQLite WASM (sql.js)  │  │
│  │  Vite + CSS Responsivo │ ──► │  BD relacional local   │  │
│  └────────────────────────┘     └──────────┬─────────────┘  │
│               │                            │                │
│               ▼                            ▼                │
│  ┌────────────────────────┐     ┌────────────────────────┐  │
│  │   OpenRouter Client    │     │   IndexedDB Storage    │  │
│  │   (LLM Stream & JSON)  │     │   (Persistencia local) │  │
│  └────────────────────────┘     └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
               │
               ▼ (Opcional, directo desde el navegador del cliente)
      [API OpenRouter / LLMs]
```

---

## 🚀 Inicio Rápido (Desarrollo Local)

### Requisitos
- [Node.js](https://nodejs.org/) v18 o superior.
- `npm` v9 o superior.

### Instalación y ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/raestrada/rumbolibre.git
cd rumbolibre

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo local
npm run dev

# 4. Compilar para producción (verifica tipado estricto)
npm run build

# 5. Previsualizar la compilación localmente
npm run preview
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador para ver la aplicación funcionando.

---

## 📁 Estructura del Proyecto

```
rumbolibre/
├── .github/              # Workflows de CI/CD para GitHub Pages y plantillas de issues
├── docs/                 # Documentación de arquitectura, temarios MINEDUC y guías
├── public/               # Iconos PWA, manifest y favicon
├── src/
│   ├── components/       # Componentes visuales compartidos (Sidebar, Logo, UI)
│   ├── data/             # Semilla curricular oficial de 1° medio y reglas MINEDUC
│   ├── db/               # SQLite WASM, esquema, queries, persistencia IndexedDB
│   ├── lib/              # Cliente OpenRouter, generador de prompts, seguridad WebCrypto
│   ├── screens/          # Pantallas de la aplicación (Home, Dashboard, SesionIA, etc.)
│   ├── App.tsx           # Enrutamiento client-side de la aplicación
│   ├── main.tsx          # Punto de entrada de React
│   └── styles.css        # Sistema de estilos responsivo sin dependencias externas
├── index.html            # Landing con SEO estructurado (JSON-LD Schema.org)
├── package.json          # Dependencias y scripts del proyecto
├── tsconfig.json         # Configuración de TypeScript estricto
└── vite.config.ts        # Configuración de compilación Vite
```

---

## 🤝 Cómo Contribuir

¡Las contribuciones de estudiantes, educadores, familias homeschoolers y desarrolladores son muy bienvenidas!

1. Lee nuestras [Pautas de Contribución](CONTRIBUTING.md) y nuestro [Código de Conducta](CODE_OF_CONDUCT.md).
2. Consulta el [Plan de Arquitectura](docs/00-plan.md) y las reglas de no-alucinación curricular en [AGENTS.md](AGENTS.md).
3. Abre un *Issue* o envía un *Pull Request* siguiendo la plantilla oficial.

---

## 🔒 Seguridad y Privacidad

- Consulta nuestra [Política de Seguridad](SECURITY.md) para más detalles sobre cómo protegemos la privacidad local y gestionamos vulnerabilidades.
- Rumbo Libre **no tiene backend propio**. Tus claves de API nunca se transmiten a ningún servidor de Rumbo Libre.

---

## 📜 Licencia

Este proyecto es software libre y de código abierto distribuido bajo la [Licencia MIT](LICENSE).

Hecho con ❤️ para la comunidad de educación libre y homeschooling en Chile.
