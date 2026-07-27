import { GovStrip } from '../../components/layout/GovStrip';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { FlagLine } from '../../components/ui/FlagLine';
import { Hero } from './Hero';
import { StatsStrip } from './StatsStrip';
import { ChannelsSection } from './ChannelsSection';
import type { Scene } from '../../data/constants';

interface PortalSceneProps {
  onNavigate: (scene: Scene) => void;
  onOpenModal: (title: string, body: string, footer?: string) => void;
}

export function PortalScene({ onNavigate, onOpenModal }: PortalSceneProps) {
  return (
    <section className="scene on" id="sc-portal">
      <GovStrip />
      <PublicHeader currentScene="portal" onNavigate={onNavigate} />
      <FlagLine />
      <main className="portal">
        <Hero onNavigate={onNavigate} onOpenModal={onOpenModal} />
        <StatsStrip />
        <ChannelsSection />
      </main>
      <PublicFooter />
    </section>
  );
}
