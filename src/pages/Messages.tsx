import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { Message, Bot } from '../types';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import styles from './Messages.module.css';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadBots();
  }, []);

  useEffect(() => {
    if (selectedBotId) {
      loadMessages();
    }
  }, [selectedBotId, page]);

  const loadBots = async () => {
    const response = await api.getBots();
    if (response.success && response.data) {
      setBots(response.data);
      if (response.data.length > 0) {
        setSelectedBotId(response.data[0].id);
      }
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    const response = await api.getMessages({ bot_id: selectedBotId, page, limit: 20 });
    if (response.success && response.data) {
      setMessages(response.data.data);
      setHasMore(response.data.data.length === 20);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const summary = useMemo(() => {
    return messages.reduce<{
      inbound: number;
      outbound: number;
      status: Record<Message['status'], number>;
    }>((acc, message) => {
      acc[message.direction] += 1;
      acc.status[message.status] = (acc.status[message.status] || 0) + 1;
      return acc;
    }, { inbound: 0, outbound: 0, status: {} as Record<Message['status'], number> });
  }, [messages]);

  if (loading && messages.length === 0) {
    return <LoadingState message="Loading message center" />;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="Messages"
        subtitle="Track customer conversations, delivery states, and automation outcomes."
        actions={(
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>
              Filter by bot
            </label>
            <select
              value={selectedBotId}
              onChange={(event) => {
                setSelectedBotId(event.target.value);
                setPage(1);
              }}
              aria-label="Select bot to filter messages"
              className={styles.filterSelect}
            >
              {bots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name} ({bot.phone_number})
                </option>
              ))}
            </select>
          </div>
        )}
      >
        <div className={styles.statsGrid}>
          {[
            { label: 'Inbound', value: summary.inbound, colorClass: 'inbound' },
            { label: 'Outbound', value: summary.outbound, colorClass: 'outbound' },
            { label: 'Delivered', value: summary.status.delivered || 0, colorClass: 'delivered' },
            { label: 'Failed', value: summary.status.failed || 0, colorClass: 'failed' }
          ].map((item) => (
            <div key={item.label} className={`${styles.statCard} ${styles[item.colorClass]}`}>
              <p className={styles.statLabel}>{item.label}</p>
              <p className={styles.statValue}>{item.value}</p>
              <p className={styles.statDescription}>Messages {item.label.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      <section className={styles.messagesSection}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className={styles.emptyTitle}>No messages yet</h3>
            <p className={styles.emptyDescription}>
              Activity will appear here once the selected bot sends or receives messages.
            </p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <article key={message.id} className={styles.messageItem}>
                <div className={styles.messageContent}>
                  <div className={styles.messageMain}>
                    <div className={`${styles.messageIcon} ${styles[message.direction]}`}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {message.direction === 'inbound' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        )}
                      </svg>
                    </div>
                    <div className={styles.messageDetails}>
                      <div className={styles.messageMeta}>
                        <span className={styles.messageNumber}>
                          {message.direction === 'inbound' ? message.from_number : message.to_number}
                        </span>
                        <span className={`${styles.messageBadge} ${styles[message.direction]}`}>
                          {message.direction}
                        </span>
                        <span className={`${styles.messageBadge} ${styles[message.status]}`}>
                          {message.status}
                        </span>
                      </div>
                      <p className={styles.messageText}>{message.content}</p>
                      <p className={styles.messageType}>
                        Type: <span className={styles.messageTypeLabel}>{message.message_type}</span>
                      </p>
                    </div>
                  </div>
                  <time className={styles.messageTime}>
                    {formatDate(message.created_at)}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {messages.length > 0 && (
        <div className={styles.pagination}>
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1}
            className={styles.paginationButton}
          >
            ← Previous
          </button>
          <span className={styles.paginationCurrent}>
            Page {page}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => value + 1)}
            disabled={!hasMore}
            className={styles.paginationButton}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

