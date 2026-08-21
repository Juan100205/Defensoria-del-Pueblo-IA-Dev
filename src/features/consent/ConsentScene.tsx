import { useState } from 'react';
import { GovStrip } from '../../components/layout/GovStrip';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { FlagLine } from '../../components/ui/FlagLine';
import { Icon } from '../../icons/Icons';
import type { Scene } from '../../data/constants';

interface ConsentSceneProps {
  onNavigate: (scene: Scene) => void;
}

export function ConsentScene({ onNavigate }: ConsentSceneProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('dp_terms_accepted', 'true');
    onNavigate('chat');
  };

  return (
    <section className="scene on" id="sc-consent">
      <GovStrip />
      <PublicHeader currentScene="portal" onNavigate={onNavigate} />
      <FlagLine />
      <main className="consent-page">
        <div className="consent-card">
          <div className="consent-icon">
            <Icon name="shield" size={36} />
          </div>
          <h2>Términos y Condiciones de Uso</h2>
          <p className="consent-subtitle">Asistente Virtual de la Defensoría del Pueblo</p>

          <div className="consent-body">
            <div className="consent-alert">
              <Icon name="alert" size={18} />
              <span>Este asistente utiliza Inteligencia Artificial para atender su solicitud.</span>
            </div>

            <h4>Tratamiento de Datos Personales</h4>
            <p>
              De conformidad con la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong>,
              la Defensoría del Pueblo, como responsable del tratamiento de sus datos personales, le informa que
              la información suministrada a través de este canal será utilizada exclusivamente para la atención y
              gestión de su solicitud (PQRSD), con las siguientes finalidades:
            </p>
            <ul>
              <li>Registro, clasificación y seguimiento de peticiones, quejas, reclamos, sugerencias y denuncias.</li>
              <li>Comunicación sobre el estado de su solicitud.</li>
              <li>Elaboración de estadísticas y reportes institucionales de forma anonimizada.</li>
              <li>Cumplimiento de obligaciones legales y función constitucional de la Defensoría del Pueblo.</li>
            </ul>

            <h4>Uso de Inteligencia Artificial</h4>
            <p>
              Este asistente emplea sistemas de inteligencia artificial para facilitar la atención al ciudadano.
              Conforme a la <strong>Guía Ética para la Implementación, Desarrollo y Uso de Sistemas de
              Inteligencia Artificial en Entidades Públicas de Colombia</strong>, le informamos que:
            </p>
            <ul>
              <li>La IA opera como herramienta de apoyo. Toda decisión final será revisada por un funcionario humano.</li>
              <li>Sus datos serán tratados con medidas de seguridad y confidencialidad reforzadas.</li>
              <li>No se realizarán decisiones automatizadas que afecten sus derechos sin supervisión humana.</li>
              <li>Puede solicitar en cualquier momento la revisión o eliminación de su información.</li>
            </ul>

            <h4>Sus Derechos</h4>
            <p>
              Como titular de los datos, usted tiene derecho a <strong>conocer, actualizar, rectificar y solicitar
              la supresión</strong> de su información personal, así como a <strong>revocar la autorización</strong>
              otorgada, según lo establecido en la Ley 1581 de 2012. Para ejercer estos derechos, puede contactar
              a nuestro运转al de Protección de Datos Personales a través de la plataforma web institucional.
            </p>

            <div className="consent-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
                <span>
                  <strong>Acepto y autorizo</strong> el tratamiento de mis datos personales conforme a los
                  términos descritos anteriormente, y reconozco que esta comunicación se realiza a través de un
                  sistema de inteligencia artificial de la Defensoría del Pueblo.
                </span>
              </label>
            </div>

            <p className="consent-link">
              Para mayor información, consulte la{' '}
              <a
                href="https://www.defensoria.gov.co/documents/20123/1405761/Protecciondedatospersonales.pdf/0695889f-96e8-df23-0e5d-0542fb3a8778?t=1743431809743"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Protección de Datos Personales
              </a>{' '}
              oficial de la Defensoría del Pueblo.
            </p>
          </div>

          <div className="consent-actions">
            <button className="btn btn-ghost btn-lg" onClick={() => onNavigate('portal')}>
              <Icon name="back" size={18} /> Volver
            </button>
            <button
              className="btn btn-primary btn-lg"
              disabled={!accepted}
              onClick={handleAccept}
            >
              Acepto y Continuar <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </section>
  );
}
