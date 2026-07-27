import { useState, useCallback } from 'react';
import { SvgDefs } from './icons/Icons';
import { Toast } from './components/ui/Toast';
import { Modal } from './components/ui/Modal';
import { DemoBar } from './components/layout/DemoBar';
import { PortalScene } from './features/portal/PortalScene';
import { ChatScene } from './features/chat/ChatScene';
import { ConfirmationScene } from './features/confirmation/ConfirmationScene';
import { MailScene } from './features/mail/MailScene';
import { ProcessingScene } from './features/processing/ProcessingScene';
import { AdminScene } from './features/admin/AdminScene';
import { useToast } from './hooks/useToast';
import type { Scene } from './data/constants';

function App() {
  const [scene, setScene] = useState<Scene>('portal');
  const toast = useToast();
  const [modalState, setModalState] = useState({ open: false, title: '', body: '', footer: '' });

  const [radicado] = useState('DP-2026-014782');
  const [fecha] = useState('22 de julio de 2026');
  const [hora] = useState('16:40 (GMT-5)');
  const [chatData, setChatData] = useState<Record<string, string>>({});

  const handleSceneChange = useCallback((s: Scene) => {
    setScene(s);
    window.scrollTo(0, 0);
    const view = document.querySelector('.view');
    if (view) view.scrollTop = 0;
  }, []);

  const handleChatFinished = useCallback((data: Record<string, string>) => {
    setChatData(data);
    setScene('conf');
  }, []);

  const openModal = useCallback((title: string, body: string, footer?: string) => {
    setModalState({ open: true, title, body, footer: footer || '' });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <div id="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SvgDefs />

      {scene === 'portal' && <PortalScene onNavigate={handleSceneChange} onOpenModal={openModal} />}
      {scene === 'chat' && <ChatScene onNavigate={handleSceneChange} onFinished={handleChatFinished} />}
      {scene === 'conf' && (
        <ConfirmationScene
          radicado={radicado}
          fecha={fecha}
          hora={hora}
          data={chatData}
          onNavigate={handleSceneChange}
        />
      )}
      {scene === 'mail' && (
        <MailScene
          radicado={radicado}
          correo={chatData.correo || 'ciudadano@correo.com'}
          hora={hora}
          data={chatData}
          onNavigate={handleSceneChange}
        />
      )}
      {scene === 'proc' && (
        <ProcessingScene
          onNavigate={handleSceneChange}
          data={chatData}
        />
      )}
      {scene === 'admin' && <AdminScene onNavigateScene={handleSceneChange} />}

      <Toast message={toast.message} visible={toast.visible} />
      <Modal
        open={modalState.open}
        title={modalState.title}
        body={modalState.body}
        footer={modalState.footer}
        onClose={closeModal}
      />
      <DemoBar currentScene={scene} onNavigate={handleSceneChange} />
    </div>
  );
}

export default App;
