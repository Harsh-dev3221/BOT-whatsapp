import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BusinessList from './pages/BusinessList';
import BotList from './pages/BotList';
import Messages from './pages/Messages';
import BookingSettings from './pages/BookingSettings';
import BotSettings from './pages/BotSettings';
import BotDashboard from './pages/BotDashboard';
import { WebChatDemo } from './pages/WebChatDemo';
import styles from './App.module.css';

function AppContent() {
  const location = useLocation();
  const currentPage = location.pathname.split('/')[1] || 'dashboard';

  // Check if we're on the bot-dashboard or webchat-demo route (should not show admin nav)
  const isBotDashboard = location.pathname.startsWith('/bot-dashboard/');
  const isWebChatDemo = location.pathname.startsWith('/webchat-demo');

  const navigation = useMemo(
    () => [
      {
        id: 'dashboard',
        path: '/',
        label: 'Dashboard',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        id: 'businesses',
        path: '/businesses',
        label: 'Businesses',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        id: 'bots',
        path: '/bots',
        label: 'Bots',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        ),
      },
      {
        id: 'messages',
        path: '/messages',
        label: 'Messages',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ),
      },
    ],
    []
  );

  // If on bot-dashboard or webchat-demo, render without admin navigation
  if (isBotDashboard || isWebChatDemo) {
    return (
      <div className={styles.appContainer}>
        <Routes>
          <Route path="/bot-dashboard/:botId" element={<BotDashboard />} />
          <Route path="/webchat-demo" element={<WebChatDemo />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      {/* Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className={styles.logoText}>
              <p className={styles.logoTitle}>WhatsApp Bot SaaS</p>
              <p className={styles.logoSubtitle}>Multi-tenant Platform</p>
            </div>
          </div>

          <div className={styles.navLinks}>
            {navigation.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`${styles.navButton} ${isActive ? styles.active : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className={styles.activeIndicator} aria-hidden="true" />
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className={styles.mobileNav}>
            <select
              value={currentPage}
              onChange={(event) => window.location.href = navigation.find(n => n.id === event.target.value)?.path || '/'}
              aria-label="Select a dashboard page"
              className={styles.mobileSelect}
            >
              {navigation.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Dashboard onSelectBusiness={() => { }} />} />
          <Route path="/businesses" element={<BusinessList />} />
          <Route path="/bots" element={<BotList />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/booking-settings/:businessId" element={<BookingSettings />} />
          <Route path="/bot-settings/:botId" element={<BotSettings />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;

