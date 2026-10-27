export interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  decreto: string;
  descripcion: string;
}

export interface Asignatura {
  id: string;
  cursoId: string;
  codigo: string;
  nombre: string;
  color: string;
  icono: string;
  ejes: string[];
}

export type TipoActividad = 'aprender' | 'practicar' | 'evaluar' | 'resumir';

export interface Actividad {
  tipo: TipoActividad;
  titulo: string;
  descripcion: string;
}

export interface Modulo {
  id: string;
  asignaturaId: string;
  codigo: string;
  numero: string;
  titulo: string;
  descripcion: string;
  indicadores: string[];
  contenidos?: string[];
  eje?: string;
}

export interface Lectura {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  area: string;
  temas: string[];
  cursosAplica: string[];
  edadMinima: number;
  porQue: string;
}

export const ACTIVIDADES: Actividad[] = [
  {
    tipo: 'aprender',
    titulo: 'Explorar el tema',
    descripcion: 'Aprende con tu agente de IA usando el prompt de búsqueda.',
  },
  {
    tipo: 'practicar',
    titulo: 'Ponerse a prueba',
    descripcion: 'Responde un quiz corto y guarda el resultado de tu IA.',
  },
  {
    tipo: 'evaluar',
    titulo: 'Examen del módulo',
    descripcion: 'Simula el examen (25 preguntas, nota 1–7) y guarda la evaluación.',
  },
  {
    tipo: 'resumir',
    titulo: 'Crear apuntes',
    descripcion: 'Resume lo aprendido y guarda tus apuntes estructurados.',
  },
];

export const ACTIVIDAD_TIPO_LABEL: Record<TipoActividad, string> = {
  aprender: 'Aprender',
  practicar: 'Practicar',
  evaluar: 'Evaluar',
  resumir: 'Apuntes',
};
