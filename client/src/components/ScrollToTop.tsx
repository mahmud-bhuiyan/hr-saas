import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const APP_MAIN_ID = 'app-main';

export const scrollAppToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.getElementById(APP_MAIN_ID)?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
};

export const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    scrollAppToTop();
  }, [pathname, search]);

  return null;
};
