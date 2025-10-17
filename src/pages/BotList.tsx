import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Bot, Business } from '../types';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import styles from './BotList.module.css';

export default function BotList() {
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [showWebBotModal, setShowWebBotModal] = useState(false);
  const [showEmbedCodeModal, setShowEmbedCodeModal] = useState(false);
  const [embedCodeData, setEmbedCodeData] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [pairingPhone, setPairingPhone] = useState('');
  const [formData, setFormData] = useState({
    business_id: '',
    name: '',
    phone_number: '',
  });
  const [webBotFormData, setWebBotFormData] = useState({
    business_id: '',
    name: '',
    primaryColor: '#5A3EF0',
    botName: '',
    greeting: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [botsRes, businessesRes] = await Promise.all([
      api.getBots(),
      api.getBusinesses(),
    ]);
    if (botsRes.success && botsRes.data) setBots(botsRes.data);
    if (businessesRes.success && businessesRes.data) setBusinesses(businessesRes.data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await api.createBot(formData);
    if (response.success) {
      setShowModal(false);
      setFormData({ business_id: '', name: '', phone_number: '' });
      loadData();
    }
  };

  const handleCreateWebBot = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await api.createWebBot({
      business_id: webBotFormData.business_id,
      name: webBotFormData.name,
      theme: {
        primaryColor: webBotFormData.primaryColor,
        botName: webBotFormData.botName || webBotFormData.name,
      },
      greeting: webBotFormData.greeting || undefined,
    });

    if (response.success) {
      setShowWebBotModal(false);
      setEmbedCodeData(response);
      setShowEmbedCodeModal(true);
      setWebBotFormData({
        business_id: '',
        name: '',
        primaryColor: '#5A3EF0',
        botName: '',
        greeting: '',
      });
      loadData();
    }
  };

  const handleToggleWebChat = async (bot: Bot, enabled: boolean) => {
    if (enabled) {
      // Enable web chat
      const response = await api.enableWebChat(bot.id, {
        theme: {
          primaryColor: '#5A3EF0',
          botName: bot.name,
        },
      });

      if (response.success) {
        setEmbedCodeData(response);
        setShowEmbedCodeModal(true);
        loadData();
      }
    } else {
      // Disable web chat
      const confirmed = confirm('Are you sure you want to disable web chat for this bot?');
      if (confirmed) {
        const response = await api.disableWebChat(bot.id);
        if (response.success) {
          loadData();
        }
      }
    }
  };

  const handleStart = async (botId: string) => {
    await api.startBot(botId);
    setQrCode(null);
    setShowQRModal(true);
    pollQRCode(botId);
  };

  const pollQRCode = async (botId: string) => {
    const interval = setInterval(async () => {
      const response = await api.getBotQR(botId);
      if (response.success && response.data?.qr_code) {
        setQrCode(response.data.qr_code);
        clearInterval(interval);
      } else {
        clearInterval(interval);
        setShowQRModal(false);
        loadData();
      }
    }, 2000);

    setTimeout(() => clearInterval(interval), 60000);
  };

  const handleStop = async (botId: string) => {
    await api.stopBot(botId);
    loadData();
  };

  const handleRequestPairingCode = async (botId: string) => {
    if (!pairingPhone) {
      alert('Please enter a phone number');
      return;
    }

    // Clean phone number - remove +, spaces, dashes, parentheses
    const cleanPhone = pairingPhone.replace(/[\+\s\-\(\)]/g, '');

    if (cleanPhone.length < 10) {
      alert('Please enter a valid phone number with country code (e.g., 1234567890)');
      return;
    }

    const response = await api.requestPairingCode(botId, cleanPhone);
    if (response.success && response.data?.pairingCode) {
      setPairingCode(response.data.pairingCode);
    } else {
      alert('Failed to generate pairing code. Please try again or use QR code instead.');
    }
  };

  const distribution = useMemo(() => {
    const totals = bots.reduce(
      (acc, bot) => {
        acc[bot.status] = (acc[bot.status] || 0) + 1;
        return acc;
      },
      {} as Record<Bot['status'], number>
    );
    return totals;
  }, [bots]);

  if (loading) {
    return <LoadingState message="Syncing bot registry" />;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="WhatsApp Bots"
        subtitle="Provision, monitor, and operate your automation fleet with real-time visibility. Enable web chat for any bot to embed it on your website."
        actions={(
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={styles.submitButton}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
            </svg>
            New WhatsApp Bot
          </button>
        )}
      >
        <div className={styles.statsGrid}>
          {(['connected', 'connecting', 'disconnected', 'failed'] as Bot['status'][]).map((status) => {
            const labels: Record<Bot['status'], { label: string }> = {
              connected: { label: 'Connected' },
              connecting: { label: 'Connecting' },
              disconnected: { label: 'Disconnected' },
              failed: { label: 'Failed' },
            };
            const data = labels[status];
            return (
              <div key={status} className={`${styles.statCard} ${styles[status]}`}>
                <p className={styles.statLabel}>{data.label}</p>
                <p className={`${styles.statValue} ${styles[status]}`}>{distribution[status] || 0}</p>
                <p className={styles.statDescription}>Instances currently {data.label.toLowerCase()}</p>
              </div>
            );
          })}
        </div>
      </PageHeader>

      <section className={styles.botGrid}>
        {bots.map((bot) => (
          <article key={bot.id} className={styles.botCard}>
            <div className={styles.cardHeader}>
              <div className={styles.botInfo}>
                <div className={styles.botIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className={styles.botDetails}>
                  <h3 className={styles.botName}>{bot.name}</h3>
                  <p className={styles.botPhone}>{bot.phone_number}</p>
                  <p className={styles.botDate}>Created {new Date(bot.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`${styles.statusBadge} ${styles[bot.status]}`}>
                <span className={`${styles.statusDot} ${styles[bot.status]}`} />
                {bot.status}
              </span>
            </div>

            <div className={styles.botMeta}>
              {[
                { label: 'Business', value: businesses.find((business) => business.id === bot.business_id)?.name ?? 'Unknown' },
                { label: 'Last connected', value: bot.last_connected_at ? new Date(bot.last_connected_at).toLocaleString() : 'Never' },
                { label: 'Dashboard URL', value: `/bot-dashboard/${bot.id}`, isUrl: true }
              ].map((item) => (
                <div key={item.label} className={styles.metaRow}>
                  <span className={styles.metaLabel}>{item.label}</span>
                  {item.isUrl ? (
                    <button
                      type="button"
                      onClick={() => navigate(item.value)}
                      className={styles.metaLink}
                      title="Click to open dashboard"
                    >
                      {item.value}
                    </button>
                  ) : (
                    <span className={styles.metaValue}>{item.value}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Web Chat Toggle */}
            <div className={styles.webChatToggle} style={{ padding: '16px 0', borderTop: '1px solid #e5e7eb' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  🌐 Enable Web Chat
                </span>
                <input
                  type="checkbox"
                  checked={(bot as any).web_chat_enabled || false}
                  onChange={(e) => handleToggleWebChat(bot, e.target.checked)}
                  style={{ width: '44px', height: '24px', cursor: 'pointer' }}
                />
              </label>
              {(bot as any).web_chat_enabled && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                  ✅ Web chat is enabled for this bot
                </div>
              )}
            </div>

            <div className={styles.actions}>
              {bot.status === 'connected' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleStop(bot.id)}
                    className={`${styles.actionButton} ${styles.danger}`}
                  >
                    Stop bot
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/bot-dashboard/${bot.id}`)}
                    className={styles.actionButton}
                    title="Open Bot Dashboard"
                  >
                    📊 Dashboard
                  </button>
                  {(bot as any).web_chat_enabled && (
                    <button
                      type="button"
                      onClick={() => navigate(`/webchat-demo?botId=${bot.id}`)}
                      className={styles.actionButton}
                      title="Test Web Chat Widget"
                    >
                      💬 Test Widget
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/booking-settings/${bot.business_id}`)}
                    className={styles.actionButton}
                  >
                    📅 Booking Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/bot-settings/${bot.id}`)}
                    className={styles.actionButton}
                  >
                    🤖 Bot Settings
                  </button>
                </>
              ) : (
                <>
                  {/* WhatsApp Bot - Show connection buttons */}
                  <button
                    type="button"
                    onClick={() => handleStart(bot.id)}
                    className={`${styles.actionButton} ${styles.primary}`}
                  >
                    Start bot
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQrCode(bot.qr_code ?? null);
                      setShowQRModal(true);
                      if (!bot.qr_code) {
                        pollQRCode(bot.id);
                      }
                    }}
                    className={styles.actionButton}
                  >
                    Show QR
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPairingCode(null);
                      setPairingPhone(bot.phone_number || '');
                      setShowPairingModal(true);
                      setFormData({ ...formData, business_id: bot.id });
                    }}
                    className={styles.actionButton}
                  >
                    Pairing Code
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/bot-dashboard/${bot.id}`)}
                    className={styles.actionButton}
                    title="Open Bot Dashboard"
                  >
                    📊 Dashboard
                  </button>
                  {(bot as any).web_chat_enabled && (
                    <button
                      type="button"
                      onClick={() => navigate(`/webchat-demo?botId=${bot.id}`)}
                      className={styles.actionButton}
                      title="Test Web Chat Widget"
                    >
                      💬 Test Widget
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/booking-settings/${bot.business_id}`)}
                    className={styles.actionButton}
                  >
                    📅 Booking Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/bot-settings/${bot.id}`)}
                    className={styles.actionButton}
                  >
                    🤖 Bot Settings
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </section>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className={styles.closeButton}
              aria-label="Close"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className={styles.modalTitle}>Add new bot</h2>
            <p className={styles.modalSubtitle}>Assign a WhatsApp number to an existing business tenant.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Business</label>
                <select
                  required
                  value={formData.business_id}
                  onChange={(e) => setFormData({ ...formData, business_id: e.target.value })}
                  aria-label="Select a business for the bot"
                  className={styles.select}
                >
                  <option value="">Select a business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Bot name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.input}
                  placeholder="Support bot"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className={styles.input}
                  placeholder="+1 234 567 890"
                />
              </div>

              <div className={styles.formButtons}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  Create bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.qrModal}`}>
            <h2 className={styles.modalTitle}>Scan QR code</h2>
            <p className={styles.modalSubtitle}>
              Open WhatsApp on your device and scan this code to authenticate the bot session.
            </p>
            {qrCode ? (
              <div className={styles.qrContainer}>
                <div className={styles.qrWrapper}>
                  <img src={qrCode} alt="WhatsApp QR code" className={styles.qrImage} />
                </div>
              </div>
            ) : (
              <LoadingState compact message="Waiting for WhatsApp session" />
            )}
            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              className={styles.qrCloseButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPairingModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.qrModal}`}>
            <h2 className={styles.modalTitle}>Pairing Code Authentication</h2>
            <p className={styles.modalSubtitle}>
              Enter your phone number to receive a pairing code. Then enter the code in WhatsApp.
            </p>

            {!pairingCode ? (
              <div className={styles.formGroup}>
                <label htmlFor="pairingPhone" className={styles.label}>
                  Phone Number (with country code)
                </label>
                <input
                  id="pairingPhone"
                  type="tel"
                  value={pairingPhone}
                  onChange={(e) => setPairingPhone(e.target.value)}
                  placeholder="e.g., 1234567890"
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={() => handleRequestPairingCode(formData.business_id)}
                  className={styles.submitButton}
                  style={{ marginTop: '1rem' }}
                >
                  Generate Pairing Code
                </button>
              </div>
            ) : (
              <div className={styles.qrContainer}>
                <div className={styles.pairingCodeDisplay}>
                  <h3 style={{ fontSize: '2rem', letterSpacing: '0.5rem', margin: '2rem 0' }}>
                    {pairingCode}
                  </h3>
                  <p style={{ marginTop: '1rem', color: '#666' }}>
                    Enter this code in WhatsApp:<br />
                    Settings → Linked Devices → Link a Device → Link with phone number instead
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowPairingModal(false);
                setPairingCode(null);
                setPairingPhone('');
              }}
              className={styles.qrCloseButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Web Bot Creation Modal */}
      {showWebBotModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button
              type="button"
              onClick={() => setShowWebBotModal(false)}
              className={styles.modalClose}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className={styles.modalTitle}>Create Web Chat Bot</h2>
            <p className={styles.modalDescription}>
              Create a bot that can be embedded on any website via a chat widget.
              No WhatsApp connection required!
            </p>
            <form onSubmit={handleCreateWebBot} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="web-business" className={styles.label}>
                  Business
                </label>
                <select
                  id="web-business"
                  value={webBotFormData.business_id}
                  onChange={(e) => setWebBotFormData({ ...webBotFormData, business_id: e.target.value })}
                  className={styles.input}
                  required
                >
                  <option value="">Select a business</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="web-name" className={styles.label}>
                  Bot Name
                </label>
                <input
                  id="web-name"
                  type="text"
                  value={webBotFormData.name}
                  onChange={(e) => setWebBotFormData({ ...webBotFormData, name: e.target.value })}
                  placeholder="e.g., Customer Support Bot"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="web-bot-name" className={styles.label}>
                  Display Name (shown in widget)
                </label>
                <input
                  id="web-bot-name"
                  type="text"
                  value={webBotFormData.botName}
                  onChange={(e) => setWebBotFormData({ ...webBotFormData, botName: e.target.value })}
                  placeholder="e.g., AI Assistant (optional, defaults to Bot Name)"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="web-color" className={styles.label}>
                  Primary Color
                </label>
                <div className={styles.colorInputGroup}>
                  <input
                    id="web-color"
                    type="color"
                    value={webBotFormData.primaryColor}
                    onChange={(e) => setWebBotFormData({ ...webBotFormData, primaryColor: e.target.value })}
                    className={styles.colorPicker}
                  />
                  <input
                    type="text"
                    value={webBotFormData.primaryColor}
                    onChange={(e) => setWebBotFormData({ ...webBotFormData, primaryColor: e.target.value })}
                    className={`${styles.input} ${styles.colorText}`}
                    placeholder="#5A3EF0"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="web-greeting" className={styles.label}>
                  Greeting Message (optional)
                </label>
                <textarea
                  id="web-greeting"
                  value={webBotFormData.greeting}
                  onChange={(e) => setWebBotFormData({ ...webBotFormData, greeting: e.target.value })}
                  placeholder="e.g., Hello! How can I help you today?"
                  className={styles.input}
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowWebBotModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Create Web Bot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {showEmbedCodeModal && embedCodeData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '800px' }}>
            <button
              type="button"
              onClick={() => {
                setShowEmbedCodeModal(false);
                setEmbedCodeData(null);
              }}
              className={styles.modalClose}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 className={styles.modalTitle}>🎉 Web Bot Created Successfully!</h2>
            <p className={styles.modalDescription}>
              Your web chat bot is ready! Copy the code below and paste it into your website.
            </p>

            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Bot Details
              </h3>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <p><strong>Bot ID:</strong> {embedCodeData.bot.id}</p>
                <p><strong>Name:</strong> {embedCodeData.bot.name}</p>
                <p><strong>Status:</strong> <span style={{ color: '#10b981' }}>● Connected</span></p>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Widget Token (Save this securely!)
              </h3>
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fbbf24' }}>
                <code style={{ wordBreak: 'break-all', fontSize: '14px' }}>
                  {embedCodeData.widget.token}
                </code>
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#92400e' }}>
                  ⚠️ This is the only time you'll see this token. Save it now!
                </p>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                Embed Code (Paste in your website)
              </h3>
              <div style={{ position: 'relative' }}>
                <pre style={{
                  background: '#1f2937',
                  color: '#10b981',
                  padding: '16px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontSize: '12px',
                  maxHeight: '300px',
                }}>
                  {embedCodeData.integration.embedCode}
                </pre>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(embedCodeData.integration.embedCode);
                    alert('Embed code copied to clipboard!');
                  }}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Copy Code
                </button>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e40af' }}>
                  📝 Next Steps:
                </h4>
                <ol style={{ marginLeft: '20px', fontSize: '14px', color: '#1e40af' }}>
                  <li>Copy the widget token and save it securely</li>
                  <li>Copy the embed code above</li>
                  <li>Paste it into your website HTML (before closing &lt;/body&gt; tag)</li>
                  <li>The chat widget will appear on your website!</li>
                  <li>Test it at: <a href="/webchat-demo" style={{ color: '#2563eb', textDecoration: 'underline' }}>/webchat-demo</a></li>
                </ol>
              </div>
            </div>

            <div className={styles.formActions} style={{ marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowEmbedCodeModal(false);
                  setEmbedCodeData(null);
                }}
                className={styles.submitButton}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

