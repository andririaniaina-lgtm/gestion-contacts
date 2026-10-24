import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(form);
      navigate('/');
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: Record<string, string[] | string> };
        message?: string;
      };
      
      const data = axiosError.response?.data;
      
      if (data && typeof data === 'object') {
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          setError(firstError[0]);
        } else if (typeof firstError === 'string') {
          setError(firstError);
        } else {
          setError("Erreur de validation. Vérifiez vos champs.");
        }
      } else if (axiosError.message) {
        setError(axiosError.message);
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <UserPlus size={26} color="white" />
          </div>
          <h1 style={styles.title}>Créer un compte</h1>
          <p style={styles.subtitle}>Rejoignez la gestion de contacts</p>
        </div>

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
              value={form.first_name}
              onChange={(v) => handleChange('first_name', v)}
            />
            <Field
              label="Nom"
              value={form.last_name}
              onChange={(v) => handleChange('last_name', v)}
            />
          </div>

          <Field
            label="Nom d'utilisateur"
            value={form.username}
            onChange={(v) => handleChange('username', v)}
            required
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => handleChange('email', v)}
            required
          />

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <div style={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                style={{ ...styles.input, paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                title={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Field
            label="Confirmer le mot de passe"
            type="password"
            value={form.password2}
            onChange={(v) => handleChange('password2', v)}
            required
          />

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Création...' : "S'inscrire"}
          </button>
        </form>

        <p style={styles.footer}>
          Déjà un compte ?{' '}
          <Link to="/login" style={styles.link}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SOUS-COMPOSANT
// ============================================================

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={styles.input}
      />
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    padding: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '480px',
    boxShadow: 'var(--shadow-lg)',
  },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  subtitle: { color: 'var(--color-text-secondary)', fontSize: '0.9rem' },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: '#FEF2F2',
    color: 'var(--color-danger)',
    borderRadius: 'var(--radius)',
    fontSize: '0.875rem',
    marginBottom: '1.25rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '1rem',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.85rem', fontWeight: 500 },
  input: {
    padding: '0.7rem 0.9rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  button: {
    padding: '0.85rem',
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '0.5rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem',
  },
  link: { color: 'var(--color-primary)', fontWeight: 600 },
};