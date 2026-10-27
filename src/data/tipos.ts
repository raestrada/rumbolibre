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

export type TipoActividad = 'estudiar' | 'evaluar' | 'apuntes';

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
  rating?: number;
}

// Pasos por módulo, en orden. El paso 2 (evaluar) se desbloquea al completar el 1 (estudiar).
export const ACTIVIDADES: Actividad[] = [
  {
    tipo: 'estudiar',
    titulo: 'Estudiar el tema',
    descripcion: 'Aprende con tu agente de IA y, cuando termines, marca este paso como listo.',
  },
  {
    tipo: 'evaluar',
    titulo: 'Evaluarte',
    descripcion: 'Simula el examen (25 preguntas, nota 1–7) y guarda tu resultado.',
  },
  {
    tipo: 'apuntes',
    titulo: 'Crear apuntes',
    descripcion: 'Resume lo aprendido y guarda tus apuntes (opcional).',
  },
];

export const ACTIVIDAD_TIPO_LABEL: Record<TipoActividad, string> = {
  estudiar: 'Estudiar',
  evaluar: 'Evaluar',
  apuntes: 'Apuntes',
};

export const NOTA_APROBACION = 4.0;
