import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Loader2 } from 'lucide-react';
import { contactsService } from '../api';
import { ContactCard } from '../components/ContactCard';
import type { Contact } from '../types';

export function FavoritesPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await contactsService.list({ favorite: true });
      setContacts(data.results);
    } catch {
      setError('Impossible de charger les favoris.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleToggleFavorite = async (id: number) => {
    // Retire immédiatement de la liste (car on est sur la page Favoris)
    setContacts((prev) => prev.filter((c) => c.id !== id));
    try {
      await contactsService.toggleFavorite(id);
    } catch {
      // En cas d'erreur, on recharge la liste
      loadFavorites();
    }
  };

  const handleSoftDelete = async (id: number) => {
    if (!confirm('Mettre ce contact à la corbeille ?')) return;
    try {
      await contactsService.softDelete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Star
              size={26}
              fill="#F59E0B"
              color="#F59E0B"
              style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}
            />
            Favoris
          </h1>
          <p style={styles.subtitle}>
            {contacts.length} contact{contacts.length > 1 ? 's' : ''} en favori
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={styles.loading}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Chargement...</span>
        </div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : contacts.length === 0 ? (
        <div style={styles.empty}>
          <Star size={48} color="var(--color-text-muted)" />
          <h3 style={styles.emptyTitle}>Aucun favori</h3>
          <p style={styles.emptyText}>
            Cliquez sur l'étoile d'un contact pour l'ajouter aux favoris.
          </p>
          <Link to="/contacts" style={styles.emptyBtn}>
            Voir tous les contacts
          </Link>
        </div>
      ) : (
        <div style={styles.list}>
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onToggleFavorite={handleToggleFavorite}
              onSoftDelete={handleSoftDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: { fontSize: '1.5rem', fontWeight: 700 },
  subtitle: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem',
    marginTop: '0.2rem',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '3rem',
    color: 'var(--color-text-secondary)',
  },
  error: {
    background: '#FEF2F2',
    color: 'var(--color-danger)',
    padding: '1rem',
    borderRadius: 'var(--radius)',
    textAlign: 'center',
  },
  empty: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--color-border)',
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  emptyTitle: { fontSize: '1.1rem', fontWeight: 600 },
  emptyText: { color: 'var(--color-text-secondary)', fontSize: '0.9rem' },
  emptyBtn: {
    marginTop: '0.75rem',
    padding: '0.6rem 1rem',
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    textDecoration: 'none',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
};