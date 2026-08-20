import { useState, useRef } from 'react';
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
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
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
          <h2>Protección de datos personales y uso de inteligencia artificial</h2>

          <div className="consent-audio">
            <audio
              ref={audioRef}
              src="/audio-proteccion.mpeg"
              onEnded={() => setPlaying(false)}
            />
            <button className={`audio-btn ${playing ? 'playing' : ''}`} onClick={toggleAudio}>
              <Icon name={playing ? 'x' : 'clock'} size={18} />
              <span>{playing ? 'Detener audio' : 'Escuchar mensaje'}</span>
            </button>
            {playing && <span className="audio-hint">Escuche mientras lee el texto a continuación</span>}
          </div>

          <div className="consent-body">
            <p>
              Sus datos personales están protegidos no solo por lo dispuesto en la Ley 1581 de 2012 y el
              Decreto 1377 de 2013, que consagran los principios de legalidad, finalidad, libertad,
              veracidad, transparencia, acceso y circulación restringida, seguridad y confidencialidad en
              el tratamiento de información personal en Colombia, sino también por los estándares éticos
              adicionales que rigen el uso de sistemas de inteligencia artificial en el sector público,
              conforme a la Guía Ética para la Implementación, Desarrollo y Uso de Sistemas de Inteligencia
              Artificial en Entidades Públicas de Colombia.
            </p>
            <p>
              En virtud de dicha Guía, todo tratamiento de datos personales mediante herramientas de IA se
              somete a principios de centralidad humana (la IA opera como apoyo a la decisión, sin sustituir
              la responsabilidad final del ser humano), transparencia y auditabilidad (prohibición de modelos
              de "caja negra" y exigencia de documentación técnica accesible sobre el funcionamiento de los
              algoritmos), equidad y prevención de sesgos (evaluaciones periódicas de impacto discriminatorio,
              en especial frente a grupos vulnerables), minimización de datos y gobernanza reforzada de la
              información (uso estrictamente necesario de los datos, con medidas robustas de ciberseguridad) y
              rendición de cuentas (trazabilidad de las decisiones automatizadas y mecanismos de apelación o
              reparación a su disposición).
            </p>
            <p>
              De esta manera, el tratamiento de su información no se limita a cumplir el marco legal de habeas
              data, sino que incorpora salvaguardas éticas específicas para el uso de inteligencia artificial,
              garantizando que cualquier decisión que la involucre sea explicable, auditable y sujeta a
              supervisión humana.
            </p>
            <p className="consent-link">
              Para mayor información, consulte la{' '}
              <a
                href="https://www.defensoria.gov.co/documents/20123/1405761/Protecciondedatospersonales.pdf/0695889f-96e8-df23-0e5d-0542fb3a8778?t=1743431809743&utm_source=chatgpt.com"
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
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('chat')}>
              Continuar <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      </main>
      <PublicFooter />
    </section>
  );
}
