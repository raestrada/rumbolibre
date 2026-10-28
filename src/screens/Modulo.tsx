import SesionIA from './SesionIA';

export default function Modulo({ moduloId }: { moduloId: string }): JSX.Element {
  return <SesionIA tipo="modulo" id={moduloId} />;
}
