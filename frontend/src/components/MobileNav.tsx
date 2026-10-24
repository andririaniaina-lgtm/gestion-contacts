import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Star,
  Trash2,
  User,
} from 'lucide-react';

const items = [
  { to: '/',          icon: LayoutDashboard, label: 'Accueil', end: true },
  { to: '/contacts',  icon: Users,           label: 'Contacts' },
  { to: '/favorites', icon: Star,            label: 'Favoris' },
  { to: '/trash',     icon: Trash2,          label: 'Corbeille' },
  { to: '/profile',   icon: User,            label: 'Profil' },
];

export function MobileNav() {
  return (
    <nav style={styles.nav}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.linkActive : {}),
          })}
        >
          <item.icon size={20} />
          <span style={styles.label}>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    background: 'white',
    borderTop: '1px solid var(--color-border)',
    display: 'none', // caché par défaut (sera affiché via media query)
    zIndex: 100,
  },
  link: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    color: 'var(--color-text-muted)',
    fontSize: '0.7rem',
    fontWeight: 500,
    textDecoration: 'none',
  },
  linkActive: {
    color: 'var(--color-primary)',
  },
  label: {
    fontSize: '0.65rem',
  },
};