import { Emblem } from '../../icons/Icons';

export function PublicFooter() {
  return (
    <footer className="pub-foot">
      <div className="in">
        <div style={{ maxWidth: 340 }}>
          <div className="logo" style={{ color: '#fff' }}>
            <Emblem size={42} />
            <div className="wm">
              <b style={{ color: '#fff' }}>Defensoría<br />del Pueblo</b>
              <span style={{ color: '#fff', borderColor: '#fff' }}>COLOMBIA</span>
            </div>
          </div>
          <p style={{ marginTop: 14, lineHeight: 1.6 }}>
            Calle 55 # 10-32, Bogotá D.C.<br />
            Conmutador (601) 314 7300
          </p>
        </div>
        <div>
          <b style={{ color: '#fff', display: 'block', marginBottom: 10 }}>Trámites</b>
          Radicar PQR<br />
          Consultar radicado<br />
          Solicitud de tutela<br />
          Atención a víctimas
        </div>
        <div>
          <b style={{ color: '#fff', display: 'block', marginBottom: 10 }}>Entidad</b>
          Quiénes somos<br />
          Normatividad<br />
          Transparencia<br />
          Contratación
        </div>
        <div>
          <b style={{ color: '#fff', display: 'block', marginBottom: 10 }}>Políticas</b>
          Tratamiento de datos<br />
          Términos de uso<br />
          Accesibilidad<br />
          Mapa del sitio
        </div>
      </div>
    </footer>
  );
}
