import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Star,
  Edit,
  Trash2,
  Loader2,
  User as UserIcon,
  Calendar,
  FileText,
} from 'lucide-react';
import { contactsService } from '../api';
import type { Contact } from '../types';

export function ContactDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await contactsService.get(Number(id));
        setContact(data);
      } catch {
        setError('Contact introuvable.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!contact) return;
    const newState = !contact.is_favorite;
    setContact({ ...contact, is_favorite: newState });
    try {
      await contactsService.toggleFavorite(contact.id);
    } catch {
      setContact({ ...contact, is_favorite: !newState });
    }
  };

  const handleSoftDelete = async () => {
    if (!contact) return;
    if (!confirm('Mettre ce contact à la corbeille ?')) return;
    try {
      await contactsService.softDelete(contact.id);
      navigate('/contacts');
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  if (isLoading) {
    return (
      <div style={styles.loading}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Chargement...</span>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div style={styles.error}>
        <p>{error || 'Contact introuvable.'}</p>
        <Link to="/contacts" style={styles.backBtn}>
          Retour à la liste
        </Link>
      </div>
    );
  }

  const initials =
    (contact.first_name[0] || '').toUpperCase() +
    (contact.last_name[0] || '').toUpperCase();

  const avatarColor = contact.category_color || 'var(--color-primary)';

  return (
    <div style={styles.container}>
      {/* Barre retour */}
      <Link to="/contacts" style={styles.backLink}>
        <ArrowLeft size={18} />
        Retour aux contacts
      </Link>

      {/* Carte principale */}
      <div style={styles.card}>
        {/* En-tête avec avatar + actions */}
        <div style={styles.cardHeader}>
          <div style={{ ...styles.avatar, background: avatarColor }}>
            {contact.photo ? (
              <img
                src={contact.photo}
                alt={contact.full_name}
                style={styles.avatarImg}
              />
            ) : (
              initials
            )}
          </div>

          <div style={styles.headerInfo}>
            <h1 style={styles.name}>{contact.full_name}</h1>
            {(contact.job_title || contact.company) && (
              <p style={styles.job}>
                {contact.job_title}
                {contact.job_title && contact.company && ' · '}
                {contact.company}
              </p>
            )}
            {contact.category_name && (
              <span
                style={{
                  ...styles.badge,
                  background: `${contact.category_color}20`,
                  color: contact.category_color || 'var(--color-primary)',
                }}
              >
                {contact.category_name}
              </span>
            )}
          </div>

          <div style={styles.actions}>
            <button
              onClick={handleToggleFavorite}
              style={{
                ...styles.iconBtn,
                color: contact.is_favorite ? '#F59E0B' : 'var(--color-text-muted)',
              }}
              title={contact.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star
                size={20}
                fill={contact.is_favorite ? '#F59E0B' : 'none'}
              />
            </button>
            <Link
              to={`/contacts/${contact.id}/edit`}
              style={styles.iconBtn}
              title="Modifier"
            >
              <Edit size={20} />
            </Link>
            <button
              onClick={handleSoftDelete}
              style={{ ...styles.iconBtn, color: 'var(--color-danger)' }}
              title="Mettre à la corbeille"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Grille infos */}
        <div style={styles.infoGrid}>
          <InfoRow
            icon={<Mail size={16} />}
            label="Email"
            value={contact.email}
            href={`mailto:${contact.email}`}
          />
          {contact.phone && (
            <InfoRow
              icon={<Phone size={16} />}
              label="Téléphone"
              value={contact.phone}
              href={`tel:${contact.phone}`}
            />
          )}
          {contact.address && (
            <InfoRow
              icon={<MapPin size={16} />}
              label="Adresse"
              value={contact.address}
            />
          )}
          {contact.city && (
            <InfoRow
              icon={<MapPin size={16} />}
              label="Ville"
              value={contact.city}
            />
          )}
          {contact.company && (
            <InfoRow
              icon={<Building2 size={16} />}
              label="Entreprise"
              value={contact.company}
            />
          )}
          {contact.job_title && (
            <InfoRow
              icon={<Briefcase size={16} />}
              label="Fonction"
              value={contact.job_title}
            />
          )}
        </div>

        {/* Notes */}
        {contact.notes && (
          <div style={styles.notesSection}>
            <h2 style={styles.sectionTitle}>
              <FileText size={16} />
              Notes
            </h2>
            <p style={styles.notes}>{contact.notes}</p>
          </div>
        )}

        {/* Métadonnées */}
        <div style={styles.meta}>
          <span style={styles.metaItem}>
            <UserIcon size={14} />
            Créé le{' '}
            {new Date(contact.created_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <span style={styles.metaItem}>
            <Calendar size={14} />
            Modifié le{' '}
            {new Date(contact.updated_at).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SOUS-COMPOSANT
// ============================================================

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span style={styles.infoIcon}>{icon}</span>
      <div>
        <span style={styles.infoLabel}>{label}</span>
        <span style={styles.infoValue}>{value}</span>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} style={styles.infoRow}>
        {content}
      </a>
    );
  }
  return <div style={styles.infoRow}>{content}</div>;
}

// ============================================================
// STYLES
// ============================================================

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 900, margin: '0 auto' },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '4rem',
    color: 'var(--color-text-secondary)',
  },
  error: {
    textAlign: 'center',
    padding: '3rem',
    color: 'var(--color-text-secondary)',
  },
  backBtn: {
    display: 'inline-block',
    marginTop: '1rem',
    padding: '0.6rem 1rem',
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--radius)',
    textDecoration: 'none',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--color-border)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: 600,
    flexShrink: 0,
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  headerInfo: { flex: 1, minWidth: 200 },
  name: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  job: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.7rem',
    borderRadius: 999,
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  actions: { display: 'flex', gap: '0.4rem' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 'var(--radius)',
    background: 'white',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    transition: 'var(--transition)',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '0.75rem 1.5rem',
    marginBottom: '1.5rem',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0',
    textDecoration: 'none',
    color: 'inherit',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius)',
    background: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  infoValue: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  notesSection: {
    padding: '1rem 1.25rem',
    background: 'var(--color-bg)',
    borderRadius: 'var(--radius)',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  notes: { fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  meta: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    paddingTop: '1rem',
    borderTop: '1px solid var(--color-border)',
    color: 'var(--color-text-muted)',
    fontSize: '0.8rem',
  },
  metaItem: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem' },
};