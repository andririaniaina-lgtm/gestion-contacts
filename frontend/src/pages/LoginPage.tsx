import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ username, password });
      navigate('/');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Erreur de connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
           <div style={styles.header}>
              <h1 style={styles.title}>Connexion</h1>
              <p style={styles.subtitle}>Accédez à votre gestion de contacts</p>
            </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nom d'utilisateur</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex : alice"
                required
                autoFocus
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.footer}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={styles.link}>
            Créer un compte
          </Link>
        </p>
      </div>
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
    maxWidth: '420px',
    boxShadow: 'var(--shadow-lg)',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },

  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    marginBottom: '0.25rem',
  },
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
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  inputWrapper: { position: 'relative' },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.75rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'var(--transition)',
  },
  button: {
    padding: '0.85rem',
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--radius)',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '0.5rem',
    transition: 'var(--transition)',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem',
  },
  link: { color: 'var(--color-primary)', fontWeight: 600 },
};