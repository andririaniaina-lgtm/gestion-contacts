import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Star,
  Tag,
  Trash2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { contactsService } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Stats } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await contactsService.getStats();
        setStats(data);
      } catch {
        setError('Impossible de charger les statistiques.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const cards = [
    {
      label: 'Contacts',
      value: stats?.total ?? 0,
      icon: Users,
      color: 'var(--color-primary)',
      bg: 'var(--color-primary-light)',
      to: '/contacts',
    },
    {
      label: 'Favoris',
      value: stats?.favorites ?? 0,
      icon: Star,
      color: 'var(--color-warning)',
      bg: '#FEF3C7',
      to: '/favorites',
    },
    {
      label: 'Catégories',
      value: stats?.categories ?? 0,
      icon: Tag,
      color: 'var(--color-success)',
      bg: '#D1FAE5',
      to: '/contacts',
    },
    {
      label: 'Corbeille',
      value: stats?.trash ?? 0,
      icon: Trash2,
      color: 'var(--color-danger)',
      bg: '#FEE2E2',
      to: '/trash',
    },
  ];

  return (
    <div>
      {/* Bienvenue */}
      <div style={styles.welcome}>
        <h1 style={styles.title}>
          Bonjour, {user?.first_name || user?.username}
        </h1>
        <p style={styles.subtitle}>
          Voici un aperçu de votre carnet de contacts.
        </p>
      </div>

      {/* Cartes stats */}
      {error && <div style={styles.error}>{error}</div>}

      {isLoading ? (
        <div style={styles.loading}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Chargement...</span>
        </div>
      ) : (
        <div className="dashboard-grid" style={styles.grid}>
          {cards.map((card) => (
            <Link key={card.label} to={card.to} style={styles.card}>
              <div style={{ ...styles.cardIcon, background: card.bg }}>
                <card.icon size={22} color={card.color} />
              </div>
              <div style={styles.cardBody}>
                <div style={styles.cardValue}>{card.value}</div>
                <div style={styles.cardLabel}>{card.label}</div>
              </div>
              <ArrowRight size={18} color="var(--color-text-muted)" />
            </Link>
          ))}
        </div>
      )}

      {/* Raccourcis */}
      <div style={styles.shortcuts}>
        <h2 style={styles.sectionTitle}>Actions rapides</h2>
        <div style={styles.shortcutGrid}>
          <Link to="/contacts/new" style={styles.shortcut}>
            ➕ Ajouter un contact
          </Link>
          <Link to="/contacts" style={styles.shortcut}>
            📋 Voir tous les contacts
          </Link>
          <Link to="/favorites" style={styles.shortcut}>
            ⭐ Consulter les favoris
          </Link>
          <Link to="/trash" style={styles.shortcut}>
            🗑️ Gérer la corbeille
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  welcome: { marginBottom: '2rem' },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: '0.25rem',
  },
  subtitle: { color: 'var(--color-text-secondary)', fontSize: '0.95rem' },
  error: {
    background: '#FEF2F2',
    color: 'var(--color-danger)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius)',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '3rem',
    color: 'var(--color-text-secondary)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '2.5rem',
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--color-border)',
    transition: 'var(--transition)',
    color: 'inherit',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    lineHeight: 1.2,
  },
  cardLabel: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    marginTop: '0.15rem',
  },
  shortcuts: { marginTop: '1rem' },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: 'var(--color-text)',
  },
  shortcutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '0.75rem',
  },
  shortcut: {
    background: 'white',
    padding: '1rem 1.25rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--color-text)',
    transition: 'var(--transition)',
  },
};