import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users as UsersIcon,
  Filter,
  Download,
  Upload,
} from 'lucide-react';
import { contactsService, categoriesService } from '../api';
import { useDebounce } from '../hooks/useDebounce';
import { ContactCard } from '../components/ContactCard';
import type { Contact, Category } from '../types';

const PAGE_SIZE = 10;

export function ContactsPage() {
  // --- États ---
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filtres
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [ordering, setOrdering] = useState('-created_at');

  // Import CSV
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<string>('');

  const debouncedSearch = useDebounce(search, 400);

  // --- Chargement des catégories (une seule fois) ---
  useEffect(() => {
    categoriesService
      .list()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // --- Chargement des contacts ---
  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await contactsService.list({
        search: debouncedSearch || undefined,
        category: categoryFilter ?? undefined,
        ordering,
        page,
      });
      setContacts(data.results);
      setTotalCount(data.count);
      setTotalPages(Math.max(1, Math.ceil(data.count / PAGE_SIZE)));
    } catch {
      setError('Impossible de charger les contacts.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, categoryFilter, ordering, page]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Reset page si les filtres changent
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, ordering]);

  // --- Actions ---
  const handleToggleFavorite = async (id: number) => {
    // Optimistic update
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, is_favorite: !c.is_favorite } : c
      )
    );
    try {
      await contactsService.toggleFavorite(id);
    } catch {
      // Revert en cas d'erreur
      setContacts((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_favorite: !c.is_favorite } : c
        )
      );
    }
  };

  const handleSoftDelete = async (id: number) => {
    if (!confirm('Mettre ce contact à la corbeille ?')) return;
    try {
      await contactsService.softDelete(id);
      // Recharge la liste pour retirer l'élément
      loadContacts();
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  // --- Export CSV ---
  const handleExport = async () => {
    try {
      const blob = await contactsService.exportCSV();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'contacts.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Erreur lors de l'export.");
    }
  };

  // --- Import CSV ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult('');
    try {
      const result = await contactsService.importCSV(file);
      setImportResult(result.message);
      loadContacts();
      setTimeout(() => setImportResult(''), 5000);
    } catch {
      setImportResult("Erreur lors de l'import.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {/* En-tête */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Contacts</h1>
          <p style={styles.subtitle}>
            {totalCount} contact{totalCount > 1 ? 's' : ''} au total
          </p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={handleExport} style={styles.secondaryBtn}>
            <Download size={16} />
            Exporter
          </button>
          <button
            onClick={handleImportClick}
            style={styles.secondaryBtn}
            disabled={isImporting}
          >
            <Upload size={16} />
            {isImporting ? 'Import...' : 'Importer'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
          <Link to="/contacts/new" style={styles.newBtn}>
            <Plus size={18} />
            Nouveau contact
          </Link>
        </div>
      </div>

      {/* Message d'import */}
      {importResult && (
        <div style={styles.importBanner}>{importResult}</div>
      )}

      {/* Barre de filtres */}
      <div style={styles.filters}>
        <div style={styles.searchWrapper}>
          <Search size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, entreprise, ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.filterGroup}>
          <Filter size={16} color="var(--color-text-muted)" />
          <select
            value={categoryFilter ?? ''}
            onChange={(e) =>
              setCategoryFilter(e.target.value ? Number(e.target.value) : null)
            }
            style={styles.select}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            style={styles.select}
          >
            <option value="-created_at">Plus récents</option>
            <option value="created_at">Plus anciens</option>
            <option value="first_name">Prénom (A-Z)</option>
            <option value="-first_name">Prénom (Z-A)</option>
            <option value="last_name">Nom (A-Z)</option>
            <option value="-last_name">Nom (Z-A)</option>
            <option value="city">Ville (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div style={styles.loading}>
          <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Chargement des contacts...</span>
        </div>
      ) : error ? (
        <div style={styles.error}>{error}</div>
      ) : contacts.length === 0 ? (
        <div style={styles.empty}>
          <UsersIcon size={48} color="var(--color-text-muted)" />
          <h3 style={styles.emptyTitle}>Aucun contact trouvé</h3>
          <p style={styles.emptyText}>
            {search || categoryFilter
              ? 'Essayez de modifier vos filtres.'
              : 'Commencez par créer votre premier contact.'}
          </p>
          <Link to="/contacts/new" style={styles.emptyBtn}>
            <Plus size={16} /> Ajouter un contact
          </Link>
        </div>
      ) : (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  ...styles.pageBtn,
                  opacity: page === 1 ? 0.4 : 1,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={16} /> Précédent
              </button>

              <span style={styles.pageInfo}>
                Page <strong>{page}</strong> sur <strong>{totalPages}</strong>
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  ...styles.pageBtn,
                  opacity: page === totalPages ? 0.4 : 1,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
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
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  title: { fontSize: '1.5rem', fontWeight: 700 },
  subtitle: { color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' },
  newBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.7rem 1.1rem',
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--radius)',
    fontWeight: 600,
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.65rem 1rem',
    background: 'white',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'var(--transition)',
  },
  importBanner: {
    padding: '0.75rem 1rem',
    background: '#D1FAE5',
    color: '#065F46',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    marginBottom: '1rem',
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  searchWrapper: { position: 'relative', flex: 1, minWidth: 260 },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '0.7rem 1rem 0.7rem 2.75rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    background: 'white',
    fontSize: '0.9rem',
    outline: 'none',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  select: {
    padding: '0.7rem 0.9rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    background: 'white',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
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
  emptyTitle: { fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)' },
  emptyText: { color: 'var(--color-text-secondary)', fontSize: '0.9rem' },
  emptyBtn: {
    marginTop: '0.75rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    background: 'var(--color-primary)',
    color: 'white',
    borderRadius: 'var(--radius)',
    fontSize: '0.9rem',
    fontWeight: 500,
    textDecoration: 'none',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
    padding: '1rem',
  },
  pageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.55rem 1rem',
    background: 'white',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'var(--transition)',
  },
  pageInfo: { color: 'var(--color-text-secondary)', fontSize: '0.85rem' },
};