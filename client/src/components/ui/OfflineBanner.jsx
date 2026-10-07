import { WifiOff } from 'lucide-react';
import './offlineBanner.css';

export default function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return (
    <aside className="offline-banner" role="status" aria-live="polite">
      <div className="offline-banner-content">
        <WifiOff size={16} className="offline-icon" />
        <span className="offline-text">
          <strong>Offline Mode:</strong> You are disconnected. You can still navigate and read cached courses.
        </span>
      </div>
    </aside>
  );
}