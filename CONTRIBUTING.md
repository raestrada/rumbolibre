# Guía de Contribución a Rumbo Libre 🧭

¡Gracias por tu interés en colaborar con **Rumbo Libre**! Este es un proyecto de código abierto comunitario que busca hacer la educación libre y la preparación para la Validación de Estudios en Chile accesible, privada y de alta calidad para todas las familias.

Al participar en este proyecto, te comprometes a respetar nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

---

## ⚠️ Regla de Oro: No-Alucinación Curricular

Rumbo Libre tiene un compromiso ético estricto con la precisión del contenido educativo:

1. **Fuente Oficial Única**: El contenido curricular (asignaturas, Objetivos de Aprendizaje, títulos, descripciones e indicadores) **SOLO puede provenir del temario oficial publicado por el MINEDUC** (ver `docs/06-fuentes-oficiales.md` y `docs/01-temario-1medio.md`).
2. **Prohibido inventar o deducir materia**: No se pueden agregar temas de memoria ni modificar indicadores oficiales.
3. Para proponer un curso nuevo (ej. 2° medio), debe transcribirse directamente el temario oficial del MINEDUC con sus referencias correspondientes.

---

## 🛠️ Entorno de Desarrollo Local

### 1. Clonar y configurar

```bash
# 1. Haz un fork del repositorio en GitHub
# 2. Clona tu fork localmente
git clone https://github.com/TU_USUARIO/rumbolibre.git
cd rumbolibre

# 3. Instala dependencias
npm install

# 4. Inicia el servidor de desarrollo
npm run dev
```

### 2. Estándares de Código

- **TypeScript estricto**: No uses `any` implícito. Todo código nuevo debe pasar la verificación de tipos sin advertencias:
  ```bash
  npm run build
  ```
- **Sin backend**: La aplicación es 100% *client-side*. No agregues llamadas a servidores centrales ni dependencias que requieran APIs propias.
- **CSS Modular**: Usamos CSS nativo limpio con variables globales en `src/styles.css` para mantener la aplicación ligera y rápida en cualquier dispositivo.
- **Seguridad**: Nunca expongas claves en texto plano; usa WebCrypto y las utilidades de `src/lib/secureKey.ts`.

---

## 🌿 Flujo de Trabajo con Git

1. Crea una rama descriptiva a partir de `main`:
   ```bash
   git checkout -b feature/mejora-evaluacion-ciencias
   # o
   git checkout -b fix/responsivo-tarjeta-modulo
   ```
2. Realiza tus cambios con commits claros en presente (ej. `Agrega criterio de profundización en biología`).
3. Verifica que el build compile sin errores:
   ```bash
   npm run build
   ```
4. Envía un Pull Request describiendo claramente los cambios y enlazando los *issues* correspondientes.

---

## 📋 Lista de Verificación para Pull Requests

Antes de enviar tu PR, asegúrate de:
- [ ] El proyecto compila limpiamente (`npm run build`).
- [ ] Si tocaste contenido curricular, citaste la fuente oficial del MINEDUC.
- [ ] Probaste la interfaz tanto en computadores de escritorio como en pantallas móviles.
- [ ] No se añadieron dependencias pesadas innecesarias.
- [ ] Tu código respeta la privacidad de los datos locales (SQLite/IndexedDB).

¡Agradecemos mucho tu ayuda para mejorar la educación libre en Chile! 🇨🇱
