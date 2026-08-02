const SIDEBAR_STORAGE_KEY = 'hr-saas-sidebar-expanded';

export const loadSidebarExpanded = (): boolean => {
  try {
    const raw = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (raw === null) {
      return false;
    }

    return raw === 'true';
  } catch {
    return false;
  }
};

export const saveSidebarExpanded = (expanded: boolean): void => {
  localStorage.setItem(SIDEBAR_STORAGE_KEY, String(expanded));
};
