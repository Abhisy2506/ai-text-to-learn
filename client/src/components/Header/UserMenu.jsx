import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User, LogOut, LogIn, Loader2 } from 'lucide-react';

export default function UserMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();
  
  const menuRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listeners on unmount or when dropdown closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  if (isLoading) {
    return (
      <div className="avatar-fallback">
        <Loader2 size={16} className="spinner" />
      </div>
    );
  }

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        className="avatar-btn"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        {isAuthenticated && user?.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User avatar'}
            style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--border-color)' }}
          />
        ) : (
          <div className="avatar-fallback">
            <User size={18} />
          </div>
        )}
      </button>

      {dropdownOpen && (
        <div className="user-dropdown">
          {isAuthenticated ? (
            <>
              <div className="user-dropdown-info">
                <p className="user-name">{user?.name || 'Logged in user'}</p>
                <p className="user-email">{user?.email}</p>
              </div>
              <div className="dropdown-divider" />
              <button
                className="dropdown-action-btn"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <button
              className="dropdown-action-btn"
              onClick={() => loginWithRedirect()}
            >
              <LogIn size={16} />
              <span>Log in with Auth0</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}