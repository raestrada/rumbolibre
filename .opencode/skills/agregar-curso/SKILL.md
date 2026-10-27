---
name: Agregar Curso
description: Agrega un curso/año nuevo (por ejemplo 2° medio) a Rumbo Libre transcribiendo el temario oficial del MINEDUC, sin inventar contenido.
---

# Agregar un curso (ej. 2° medio)

## Objetivo
Agregar un curso/año nuevo a Rumbo Libre **sin alucinar** y **sin cambiar el esquema**.

## Pasos

1. **Descargar el temario oficial** del curso desde el MINEDUC (ver `docs/06-fuentes-oficiales.md`).
   - 2° medio: Decreto N°614/2013 (mismas 5 asignaturas que 1° medio, OA distintos).
   - 3°/4° medio: Decreto N°193/2019 (asignaturas distintas: se suma Filosofía, Educación
     Ciudadana, etc.).
2. **Transcribir fielmente** cada OA:
   - `codigo` (ej. `M2-LEN-OA1`), `numero` (ej. `"1"`), `titulo` (verbo + tema, del temario),
   - `descripcion` (objetivo del OA, resumido pero fiel),
   - `indicadores` (lista literal de los indicadores del temario),
   - `contenidos` (opcional, si el temario lo incluye).
3. **Crear** `src/data/<nivel>/` (ej. `src/data/m2/`) con un archivo por asignatura, copiando el
   formato exacto de `src/data/m1/`.
4. **Registrar** el curso y sus asignaturas en `src/data/cursos.ts` (id `m2`, codigo `M2`, orden
   siguiente). Colores e iconos libres, consistentes con lo existente.
5. **No tocar** `src/db/schema.ts`: el esquema ya soporta varios cursos; no hace falta migración.
6. **Verificar** con el skill `verificar-temario`.
7. `npm run build` para confirmar que compila.

## Reglas duras
- NO deducir el temario de memoria ni de sitios de terceros: usar el PDF oficial del MINEDUC.
- NO inventar OA para "completar". Si un OA no está en el temario, no se agrega.
- Mantener el formato de datos idéntico a 1° medio para que el render sea automático.
