import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.main}>
        <Header />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--color-bg)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  content: {
    flex: 1,
    padding: '1.5rem 2rem',
    overflow: 'auto',
  },
};