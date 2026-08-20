import { useState, useCallback } from 'react';
import { SvgDefs } from './icons/Icons';
import { Toast } from './components/ui/Toast';
import { Modal } from './components/ui/Modal';
import { DemoBar } from './components/layout/DemoBar';
import { PortalScene } from './features/portal/PortalScene';
import { ConsentScene } from './features/consent/ConsentScene';
import { ChatScene } from './features/chat/ChatScene';
import { ConfirmationScene } from './features/confirmation/ConfirmationScene';
import { MailScene } from './features/mail/MailScene';
import { ProcessingScene } from './features/processing/ProcessingScene';
import { AdminScene } from './features/admin/AdminScene';
import { LoginPage } from './features/auth/LoginPage';
import { useToast } from './hooks/useToast';
import { useAuth } from './contexts/AuthContext';
import type { Scene } from './data/constants';

function AppContent() {
  const [scene, setScene] = useState<Scene>('portal');
  const toast = useToast();
  const { user, profile, loading } = useAuth();
  const [modalState, setModalState] = useState({ open: false, title: '', body: '', footer: '' });

  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);
  const [radicado, setRadicado] = useState('DP-2026-014782');
  const [fecha] = useState('22 de julio de 2026');
  const [hora] = useState('16:40 (GMT-5)');
  const [chatData, setChatData] = useState<Record<string, string>>({});

  const handleSceneChange = useCallback((s: Scene) => {
    setScene(s);
    window.scrollTo(0, 0);
    const view = document.querySelector('.view');
    if (view) view.scrollTop = 0;
  }, []);

  const handleChatFinished = useCallback((data: Record<string, string>, caseId?: string, caseRadicado?: string) => {
    setChatData(data);
    if (caseId) setCreatedCaseId(caseId);
    if (caseRadicado) setRadicado(caseRadicado);
    setScene('conf');
  }, []);

  const openModal = useCallback((title: string, body: string, footer?: string) => {
    setModalState({ open: true, title, body, footer: footer || '' });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((s) => ({ ...s, open: false }));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--navy-050)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)' }}>Defensoría del Pueblo</div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>Cargando sistema...</div>
        </div>
      </div>
    );
  }

  return (
    <div id="app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SvgDefs />

      {scene === 'portal' && <PortalScene onNavigate={handleSceneChange} onOpenModal={openModal} />}
      {scene === 'consent' && <ConsentScene onNavigate={handleSceneChange} />}
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
          caseId={createdCaseId || undefined}
        />
      )}
      {scene === 'admin' && (
        user && profile
          ? <AdminScene onNavigateScene={handleSceneChange} />
          : <LoginPage onLoginSuccess={() => handleSceneChange('admin')} />
      )}

      <Toast message={toast.message} visible={toast.visible} />
      <Modal
        open={modalState.open}
        title={modalState.title}
        body={modalState.body}
        footer={modalState.footer}
        onClose={closeModal}
      />
      {scene !== 'admin' && (
        <DemoBar currentScene={scene} onNavigate={handleSceneChange} />
      )}
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
