import { useState, useCallback } from 'react';
import type { Scene, AdminView } from '../data/constants';

interface NavigationState {
  scene: Scene;
  adminView: AdminView;
}

const DEFAULT_STATE: NavigationState = {
  scene: 'portal',
  adminView: 'dash',
};

export function useNavigation() {
  const [state, setState] = useState<NavigationState>(DEFAULT_STATE);

  const goScene = useCallback((scene: Scene) => {
    setState((s) => ({ ...s, scene }));
    window.scrollTo(0, 0);
  }, []);

  const goAdminView = useCallback((view: AdminView) => {
    setState((s) => ({ ...s, adminView: view }));
    const el = document.querySelector('.view');
    if (el) el.scrollTop = 0;
  }, []);

  return {
    scene: state.scene,
    adminView: state.adminView,
    goScene,
    goAdminView,
  };
}
