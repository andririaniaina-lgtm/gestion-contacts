import { useEffect, useState, useCallback } from 'react';
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import { contactsService } from '../api';
import { ContactCard } from '../components/ContactCard';
import type { Contact } from '../types';

export function TrashPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConfirmingEmpty, setIsConfirmingEmpty] = useState(false);

  const loadTrash = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await contactsService.list({ trash: true });
      setContacts(data.results);
    } catch {
      setError('Impossible de charger la corbeille.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const handleRestore = async (id: number) => {
    try {
      await contactsService.restore(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Erreur lors de la restauration.');
    }
  };

  const handleHardDelete = async (id: number) => {
    if (!confirm('Supprimer définitivement ce contact ? Cette action est irréversible.')) {
      return;
    }
    try {
      await contactsService.hardDelete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await contactsService.emptyTrash();
      setContacts([]);
      setIsConfirmingEmpty(false);
    } catch {
      alert('Erreur lors du vidage de la corbeille.');
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <Trash2
              size={26}
              style={{ verticalAlign: 'middle', marginRight: '0.5rem' }}
            />
            Corbeille
          </h1>
          <p style={styles.subtitle}>
            {contacts.length} contact{contacts.length > 1 ? 's' : ''} supprimé
            {contacts.length > 1 ? 's' : ''}
          </p>
        </div>

        {contacts.length > 0 && (
          <button onClick={() => setIsConfirmingEmpty(true)} style={styles.emptyTrashBtn}>
            <Trash2 size={16} />
            Vider la corbeille
          </button>
        )}
      </div>

      {/* Confirmation de vidage */}
      {isConfirmingEmpty && (
        <div style={styles.confirmBox}>
          <div style={styles.confirmHeader}>
            <AlertTriangle size={20} color="var(--color-danger)" />
            <strong>Vider toute la corbeille ?</strong>
            <button
              onClick={() => setIsConfirmingEmpty(false)}
              style={styles.closeConfirm}
            >
              <X size={16} />
            </button>
          </div>
          <p style={styles.confirmText}>
            {contacts.length} contact(s) seront supprimés définitivement.
            Cette action est <strong>irréversible</strong>.
          </p>
          <div style={styles.confirmActions}>
            <button
              onClick={() => setIsConfirmingEmpty(false)}
              style={styles.cancelBtn}
            >
              Annuler
            </button>
            <button onClick={handleEmptyTrash} style={styles.dangerBtn}>
              Confirmer la suppression
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={styles.loading}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Chargement...</span>
        </div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : contacts.length === 0 ? (
        <div style={styles.empty}>
          <Trash2 size={48} color="var(--color-text-muted)" />
          <h3 style={styles.emptyTitle}>La corbeille est vide</h3>
          <p style={styles.emptyText}>
            Les contacts supprimés apparaîtront ici.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {contacts.map((contact) => (
            <div key={contact.id} style={styles.trashItem}>
              <ContactCard
                contact={contact}
                onToggleFavorite={() => {}}
                onRestore={handleRestore}
                isTrash
              />
              <button
                onClick={() => handleHardDelete(contact.id)}
                style={styles.hardDeleteBtn}
                title="Supprimer définitivement"
              >
                <X size={16} />
              </button>
            </div>
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
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: { fontSize: '1.5rem', fontWeight: 700 },
  subtitle: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem',
    marginTop: '0.2rem',
  },
  emptyTrashBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    background: 'var(--color-danger)',
    color: 'white',
    borderRadius: 'var(--radius)',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  confirmBox: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.25rem',
    marginBottom: '1.5rem',
  },
  confirmHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  closeConfirm: {
    marginLeft: 'auto',
    color: 'var(--color-text-secondary)',
  },
  confirmText: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.75rem',
  },
  confirmActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  cancelBtn: {
    padding: '0.55rem 1rem',
    borderRadius: 'var(--radius)',
    fontSize: '0.85rem',
    fontWeight: 500,
    background: 'white',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  dangerBtn: {
    padding: '0.55rem 1rem',
    borderRadius: 'var(--radius)',
    fontSize: '0.85rem',
    fontWeight: 500,
    background: 'var(--color-danger)',
    color: 'white',
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
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  trashItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  hardDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius)',
    background: '#FEE2E2',
    color: 'var(--color-danger)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};