import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  User,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { contactsService, categoriesService } from '../api';
import type { Category, ContactFormData } from '../types';

const EMPTY_FORM: ContactFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  company: '',
  job_title: '',
  category: null,
  notes: '',
  photo: null,
};

export function ContactFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // --- Chargement initial (catégories + contact en édition) ---
  useEffect(() => {
    const load = async () => {
      try {
        const cats = await categoriesService.list();
        setCategories(cats);

        if (isEdit && id) {
          const contact = await contactsService.get(Number(id));
          setForm({
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email,
            phone: contact.phone,
            address: contact.address,
            city: contact.city,
            company: contact.company,
            job_title: contact.job_title,
            category: contact.category,
            notes: contact.notes,
            photo: null,
          });
          if (contact.photo) {
            setPhotoPreview(contact.photo);
          }
        }
      } catch {
        setError('Impossible de charger les données.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  // --- Changement de champ ---
  const handleChange = (
    field: keyof ContactFormData,
    value: string | number | null
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Efface l'erreur du champ modifié
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // --- Upload photo ---
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 5 Mo.');
      return;
    }

    setForm((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    setForm((prev) => ({ ...prev, photo: null }));
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Validation frontend ---
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.first_name.trim()) errors.first_name = 'Le prénom est obligatoire.';
    if (!form.last_name.trim()) errors.last_name = 'Le nom est obligatoire.';
    if (!form.email.trim()) {
      errors.email = "L'email est obligatoire.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = "L'email n'est pas valide.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Soumission ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && id) {
        await contactsService.update(Number(id), form);
      } else {
        await contactsService.create(form);
      }
      navigate('/contacts');
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: Record<string, string[] | string> };
      };
      const data = axiosError.response?.data;
      if (data) {
        // Extrait les erreurs serveur
        const serverErrors: Record<string, string> = {};
        Object.entries(data).forEach(([key, value]) => {
          serverErrors[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFieldErrors(serverErrors);
        setError('Veuillez corriger les erreurs ci-dessous.');
      } else {
        setError("Une erreur est survenue lors de l'enregistrement.");
      }
    } finally {
      setIsSubmitting(false);
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

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <Link to="/contacts" style={styles.backLink}>
          <ArrowLeft size={18} />
          Retour
        </Link>
        <h1 style={styles.title}>
          {isEdit ? 'Modifier le contact' : 'Nouveau contact'}
        </h1>
        <p style={styles.subtitle}>
          {isEdit
            ? 'Modifiez les informations du contact.'
            : 'Remplissez les informations du nouveau contact.'}
        </p>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>
          {/* Colonne gauche : infos */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Informations personnelles</h2>

            <div style={styles.row}>
              <Field
                label="Prénom *"
                value={form.first_name}
                onChange={(v) => handleChange('first_name', v)}
                error={fieldErrors.first_name}
              />
              <Field
                label="Nom *"
                value={form.last_name}
                onChange={(v) => handleChange('last_name', v)}
                error={fieldErrors.last_name}
              />
            </div>

            <Field
              label="Email *"
              type="email"
              value={form.email}
              onChange={(v) => handleChange('email', v)}
              error={fieldErrors.email}
            />
            <Field
              label="Téléphone"
              value={form.phone || ''}
              onChange={(v) => handleChange('phone', v)}
              error={fieldErrors.phone}
            />

            <h2 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>
              Adresse
            </h2>

            <Field
              label="Adresse"
              value={form.address || ''}
              onChange={(v) => handleChange('address', v)}
            />
            <Field
              label="Ville"
              value={form.city || ''}
              onChange={(v) => handleChange('city', v)}
            />

            <h2 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>
              Professionnel
            </h2>

            <div style={styles.row}>
              <Field
                label="Entreprise"
                value={form.company || ''}
                onChange={(v) => handleChange('company', v)}
              />
              <Field
                label="Fonction"
                value={form.job_title || ''}
                onChange={(v) => handleChange('job_title', v)}
              />
            </div>
          </div>

          {/* Colonne droite : photo, catégorie, notes */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Photo</h2>

            <div style={styles.photoZone}>
              {photoPreview ? (
                <div style={styles.photoWrapper}>
                  <img src={photoPreview} alt="Aperçu" style={styles.photo} />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    style={styles.clearPhotoBtn}
                    title="Retirer la photo"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={styles.photoPlaceholder}>
                  <User size={40} color="var(--color-text-muted)" />
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={styles.uploadBtn}
              >
                <Upload size={16} />
                {photoPreview ? 'Changer' : 'Choisir une photo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <p style={styles.hint}>JPG, PNG · Max 5 Mo</p>
            </div>

            <h2 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>
              Catégorie
            </h2>

            <Field
              label=""
              select
              value={String(form.category ?? '')}
              onChange={(v) => handleChange('category', v ? Number(v) : null)}
            >
              <option value="">Aucune catégorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Field>

            <h2 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>
              Notes
            </h2>

            <textarea
              value={form.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={5}
              placeholder="Notes libres sur le contact..."
              style={styles.textarea}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <Link to="/contacts" style={styles.cancelBtn}>
            Annuler
          </Link>
          <button type="submit" disabled={isSubmitting} style={styles.submitBtn}>
            <Save size={18} />
            {isSubmitting
              ? 'Enregistrement...'
              : isEdit
              ? 'Enregistrer les modifications'
              : 'Créer le contact'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// SOUS-COMPOSANT Field
// ============================================================

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  select?: boolean;
  children?: React.ReactNode;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  error,
  select = false,
  children,
}: FieldProps) {
  return (
    <div style={styles.field}>
      {label && <label style={styles.label}>{label}</label>}
      {select ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.input}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            ...styles.input,
            borderColor: error ? 'var(--color-danger)' : 'var(--color-border)',
          }}
        />
      )}
      {error && <span style={styles.fieldError}>{error}</span>}
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 1100, margin: '0 auto' },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '4rem',
    color: 'var(--color-text-secondary)',
  },
  header: { marginBottom: '1.5rem' },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.75rem',
  },
  title: { fontSize: '1.5rem', fontWeight: 700 },
  subtitle: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.9rem',
    marginTop: '0.2rem',
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
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '1.5rem',
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    border: '1px solid var(--color-border)',
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '0.75rem',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  field: { marginBottom: '0.9rem' },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--color-text)',
    marginBottom: '0.3rem',
  },
  input: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    outline: 'none',
    background: 'white',
    transition: 'var(--transition)',
  },
  textarea: {
    width: '100%',
    padding: '0.65rem 0.85rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  fieldError: {
    display: 'block',
    marginTop: '0.25rem',
    fontSize: '0.75rem',
    color: 'var(--color-danger)',
  },
  photoZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  photoWrapper: { position: 'relative' },
  photo: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid var(--color-primary-light)',
  },
  clearPhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--color-danger)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'var(--color-bg)',
    border: '2px dashed var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.9rem',
    background: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    borderRadius: 'var(--radius)',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  hint: { fontSize: '0.75rem', color: 'var(--color-text-muted)' },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    paddingTop: '1rem',
  },
  cancelBtn: {
    padding: '0.7rem 1.2rem',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    background: 'white',
  },
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