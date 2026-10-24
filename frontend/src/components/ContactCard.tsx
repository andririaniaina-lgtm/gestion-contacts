import { Link } from 'react-router-dom';
import {
  Star,
  Mail,
  Phone,
  MapPin,
  Building2,
  Trash2,
  RotateCcw,
  Edit,
} from 'lucide-react';
import type { Contact } from '../types';

interface ContactCardProps {
  contact: Contact;
  onToggleFavorite: (id: number) => void;
  onSoftDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
  isTrash?: boolean;
}

export function ContactCard({
  contact,
  onToggleFavorite,
  onSoftDelete,
  onRestore,
  isTrash = false,
}: ContactCardProps) {
  const initials =
    (contact.first_name[0] || '').toUpperCase() +
    (contact.last_name[0] || '').toUpperCase();

  // Couleur de l'avatar : celle de la catégorie ou un bleu par défaut
  const avatarColor = contact.category_color || 'var(--color-primary)';

  return (
    <div style={styles.card}>
      {/* Avatar */}
      <div style={{ ...styles.avatar, background: avatarColor }}>
        {contact.photo ? (
          <img src={contact.photo} alt={contact.full_name} style={styles.avatarImg} />
        ) : (
          initials || '?'
        )}
      </div>

      {/* Infos principales */}
      <div style={styles.info}>
        <div style={styles.header}>
          <Link to={`/contacts/${contact.id}`} style={styles.name}>
            {contact.full_name}
          </Link>
          {contact.is_favorite && !isTrash && (
            <Star size={16} fill="#F59E0B" color="#F59E0B" />
          )}
        </div>

        {contact.job_title && contact.company && (
          <div style={styles.job}>
            {contact.job_title} · {contact.company}
          </div>
        )}

        <div style={styles.meta}>
          {contact.email && (
            <span style={styles.metaItem}>
              <Mail size={14} /> {contact.email}
            </span>
          )}
          {contact.phone && (
            <span style={styles.metaItem}>
              <Phone size={14} /> {contact.phone}
            </span>
          )}
          {contact.city && (
            <span style={styles.metaItem}>
              <MapPin size={14} /> {contact.city}
            </span>
          )}
        </div>

        {contact.category_name && (
          <span
            style={{
              ...styles.badge,
              background: `${contact.category_color}20`,
              color: contact.category_color || 'var(--color-primary)',
            }}
          >
            <Building2 size={12} />
            {contact.category_name}
          </span>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {isTrash ? (
          <>
            <button
              onClick={() => onRestore?.(contact.id)}
              style={styles.actionBtn}
              title="Restaurer"
            >
              <RotateCcw size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onToggleFavorite(contact.id)}
              style={{
                ...styles.actionBtn,
                color: contact.is_favorite ? '#F59E0B' : 'var(--color-text-muted)',
              }}
              title={contact.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star
                size={18}
                fill={contact.is_favorite ? '#F59E0B' : 'none'}
              />
            </button>
            <Link
              to={`/contacts/${contact.id}/edit`}
              style={styles.actionBtn}
              title="Modifier"
            >
              <Edit size={18} />
            </Link>
            <button
              onClick={() => onSoftDelete?.(contact.id)}
              style={{ ...styles.actionBtn, color: 'var(--color-danger)' }}
              title="Mettre à la corbeille"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'white',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'var(--transition)',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '1.1rem',
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { flex: 1, minWidth: 0 },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.15rem',
  },
  name: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  job: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.4rem',
  },
  meta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.4rem',
  },
  metaItem: { display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.2rem 0.6rem',
    borderRadius: 999,
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  actions: {
    display: 'flex',
    gap: '0.25rem',
    flexShrink: 0,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
    transition: 'var(--transition)',
    textDecoration: 'none',
  },
};