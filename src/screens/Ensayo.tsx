import SesionIA from './SesionIA';

export default function Ensayo({ asignaturaId }: { asignaturaId: string }): JSX.Element {
  return <SesionIA tipo="ensayo" id={asignaturaId} />;
}
