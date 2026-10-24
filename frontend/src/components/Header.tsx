import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials =
    (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase() +
    (user?.last_name?.[0] || '').toUpperCase();

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || 'Utilisateur';

  return (
    <header style={styles.header}>
      <div style={styles.spacer} />

      <div style={styles.userArea}>
        <button
          onClick={() => setShowMenu((v) => !v)}
          style={styles.userButton}
        >
          <div style={styles.avatar}>{initials}</div>
          <span style={styles.userName} className="header-username">{displayName}</span>
        </button>

        {showMenu && (
          <>
            {/* Overlay pour fermer au clic extérieur */}
            <div
              style={styles.overlay}
              onClick={() => setShowMenu(false)}
            />
            <div style={styles.menu}>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate('/profile');
                }}
                style={styles.menuItem}
              >
                <UserIcon size={16} />
                <span>Mon profil</span>
              </button>
              <button
                onClick={handleLogout}
                style={{ ...styles.menuItem, color: 'var(--color-danger)' }}
              >
                <LogOut size={16} />
                <span>Déconnexion</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: 64,
    background: 'white',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5rem',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  spacer: { flex: 1 },
  userArea: { position: 'relative' },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem',
    borderRadius: 'var(--radius)',
    transition: 'var(--transition)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'var(--color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 40,
  },
  menu: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    background: 'white',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--color-border)',
    minWidth: 180,
    padding: '0.4rem',
    zIndex: 50,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.8rem',
    width: '100%',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
    textAlign: 'left',
    color: 'var(--color-text)',
    transition: 'var(--transition)',
  },
};