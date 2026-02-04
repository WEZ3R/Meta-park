import { useNavigate } from 'react-router-dom';
import './PWALauncherPage.css';

export function PWALauncherPage() {
  const navigate = useNavigate();

  return (
    <div className="pwa-launcher">
      <div className="pwa-launcher__container">
        <h1 className="pwa-launcher__title">META PARK</h1>
        <p className="pwa-launcher__subtitle">Sélectionnez une activité</p>

        <div className="pwa-launcher__buttons">
          <button
            className="pwa-launcher__button pwa-launcher__button--dino"
            onClick={() => navigate('/dino-chase')}
          >
            <span className="pwa-launcher__button-icon">🦖</span>
            <span className="pwa-launcher__button-text">Dino Chase</span>
            <span className="pwa-launcher__button-desc">Poursuite du T-Rex</span>
          </button>

          <button
            className="pwa-launcher__button pwa-launcher__button--questionnaire"
            onClick={() => navigate('/questionnaire')}
          >
            <span className="pwa-launcher__button-icon">📋</span>
            <span className="pwa-launcher__button-text">Questionnaire</span>
            <span className="pwa-launcher__button-desc">Rapport d'incident</span>
          </button>
        </div>
      </div>
    </div>
  );
}
