import { useState, type FormEvent } from 'react';
import { User, Mail, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../api';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setIsSubmitting(true);

    try {
      const response = await authService.updateProfile(form);
      updateUser(response.user);
      setSuccess('Profil mis à jour avec succès.');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Une erreur est survenue lors de la mise à jour.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mon profil</h1>
        <p style={styles.subtitle}>Gérez vos informations personnelles.</p>
      </div>

      <div style={styles.card}>
        {/* Avatar */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
            {(user?.last_name?.[0] || '').toUpperCase()}
          </div>
          <div>
            <div style={styles.userName}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={styles.userHandle}>@{user?.username}</div>
          </div>
        </div>

        {success && (
          <div style={styles.successBox}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <Field
              label="Prénom"
              icon={<User size={16} />}
              value={form.first_name}
              onChange={(v) => setForm({ ...form, first_name: v })}
            />
            <Field
              label="Nom"
              icon={<User size={16} />}
              value={form.last_name}
              onChange={(v) => setForm({ ...form, last_name: v })}
            />
          </div>

          <Field
            label="Email"
            type="email"
            icon={<Mail size={16} />}
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />

          <div style={styles.readonly}>
            <span style={styles.readonlyLabel}>Nom d'utilisateur</span>
            <span style={styles.readonlyValue}>{user?.username}</span>
            <p style={styles.readonlyHint}>
              Le nom d'utilisateur ne peut pas être modifié.
            </p>
          </div>

          <div style={styles.actions}>
            <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
              <Save size={18} />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputWrapper}>
        {icon && <span style={styles.inputIcon}>{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...styles.input, paddingLeft: icon ? '2.5rem' : '0.9rem' }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 640, margin: '0 auto' },
  header: { marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700 },
  subtitle: { color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--color-border)',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingBottom: '1.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--color-border)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'var(--color-primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  userName: { fontSize: '1.1rem', fontWeight: 600 },
  userHandle: { fontSize: '0.85rem', color: 'var(--color-text-secondary)' },
  successBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: '#D1FAE5',
    color: '#065F46',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    marginBottom: '1rem',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: '#FEF2F2',
    color: 'var(--color-danger)',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    marginBottom: '1rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.85rem', fontWeight: 500 },
  inputWrapper: { position: 'relative' },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
  },
  input: {
    width: '100%',
    padding: '0.7rem 0.9rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  readonly: {
    background: 'var(--color-bg)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--color-border)',
  },
  readonlyLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  },
  readonlyValue: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: 500,
    marginTop: '0.15rem',
  },
  readonlyHint: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    marginTop: '0.25rem',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.7rem 1.3rem',
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
};