import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Star,
  Trash2,
  User,
  Contact2,
} from 'lucide-react';

const navItems = [
  { to: '/',          label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/contacts',  label: 'Contacts',        icon: Users },
  { to: '/favorites', label: 'Favoris',         icon: Star },
  { to: '/trash',     label: 'Corbeille',       icon: Trash2 },
  { to: '/profile',   label: 'Profil',          icon: User },
];

export function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      {/* Logo / titre */}
      <div style={styles.brand}>
        <div style={styles.brandIcon}>
          <Contact2 size={22} color="white" />
        </div>
        <div>
          <div style={styles.brandTitle}>Contacts</div>
          <div style={styles.brandSubtitle}>Gestion</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 240,
    background: 'white',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.25rem 1rem',
    height: '100vh',
    position: 'sticky',
    top: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 0.5rem 1.5rem',
    marginBottom: '0.5rem',
    borderBottom: '1px solid var(--color-border)',
  },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginTop: '1rem',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.7rem 0.9rem',
    borderRadius: 'var(--radius)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'var(--transition)',
  },
  navLinkActive: {
    background: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    fontWeight: 600,
  },
};