import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import type { Business, BusinessStats } from '../types';
import LoadingState from '../components/LoadingState';
import { TrendingUp, MessageSquare, Zap, Building2, ChevronRight, Plus } from 'lucide-react';
import styles from './Dashboard.module.css';

interface DashboardProps {
  onSelectBusiness: (id: string) => void;
}

export default function Dashboard({ onSelectBusiness }: DashboardProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<Record<string, BusinessStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const response = await api.getBusinesses();
    if (response.success && response.data) {
      setBusinesses(response.data);

      for (const business of response.data) {
        const statsResponse = await api.getBusinessStats(business.id);
        if (statsResponse.success && statsResponse.data) {
          setStats(prev => ({ ...prev, [business.id]: statsResponse.data! }));
        }
      }
    }
    setLoading(false);
  };

  const overview = useMemo(() => {
    const totals = businesses.reduce(
      (acc, business) => {
        const businessStats = stats[business.id];
        if (businessStats) {
          acc.totalBots += businessStats.totalBots;
          acc.activeBots += businessStats.activeBots;
          acc.totalMessages += businessStats.totalMessages;
        }
        return acc;
      },
      { totalBots: 0, activeBots: 0, totalMessages: 0 }
    );

    return {
      businesses: businesses.length,
      bots: totals.totalBots,
      activeBots: totals.activeBots,
      messages: totals.totalMessages,
    };
  }, [businesses, stats]);

  if (loading) {
    return <LoadingState message="Preparing your workspace" />;
  }

  if (businesses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Monitor growth across every tenant, bot, and channel.
          </p>
        </div>

        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Building2 />
          </div>
          <h2 className={styles.emptyStateTitle}>No businesses yet</h2>
          <p className={styles.emptyStateDescription}>
            Create a business profile to configure messaging bots, manage sessions, and track results.
          </p>
          <button className={styles.emptyStateButton}>
            <Plus />
            Create Your First Business
          </button>
        </div>
      </div>
    );
  }

  const statMetrics = [
    {
      icon: Building2,
      label: 'Total Businesses',
      value: overview.businesses,
      suffix: 'tenants',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200',
    },
    {
      icon: Zap,
      label: 'Total Bots',
      value: overview.bots,
      suffix: 'instances',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      icon: TrendingUp,
      label: 'Active Bots',
      value: overview.activeBots,
      suffix: 'connected',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200',
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      value: overview.messages,
      suffix: 'this month',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200',
    },
  ];

  const colorMap: Record<string, string> = {
    'bg-blue-50': 'blue',
    'bg-amber-50': 'amber',
    'bg-green-50': 'green',
    'bg-purple-50': 'purple',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>
          Monitor growth across every tenant, bot, and channel.
        </p>
      </div>

      <div className={styles.statsGrid}>
        {statMetrics.map((metric) => {
          const Icon = metric.icon;
          const colorClass = colorMap[metric.bgColor] || '';
          return (
            <div
              key={metric.label}
              className={`${styles.statCard} ${styles[colorClass]}`}
            >
              <div className={styles.statCardContent}>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>{metric.label}</p>
                  <p className={styles.statValue}>{metric.value}</p>
                  <p className={styles.statSuffix}>{metric.suffix}</p>
                </div>
                <div className={styles.statIcon}>
                  <Icon />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.businessSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Business Accounts</h2>
          <p className={styles.sectionDescription}>
            {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} active · Select one to view detailed analytics
          </p>
        </div>

        <div className={styles.businessGrid}>
          {businesses.map((business) => {
            const businessStats = stats[business.id] || {
              totalBots: 0,
              activeBots: 0,
              totalMessages: 0,
            };

            const statusConfig = {
              active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
              trial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trial' },
              inactive: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Inactive' },
            };

            const status = statusConfig[business.subscription_status as keyof typeof statusConfig] || statusConfig.inactive;

            const badgeClass = status.label.toLowerCase();

            return (
              <button
                key={business.id}
                onClick={() => onSelectBusiness(business.id)}
                className={styles.businessCard}
              >
                <div className={styles.businessHeader}>
                  <div className={styles.businessInfo}>
                    <div className={styles.businessAvatar}>
                      {business.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.businessDetails}>
                      <div className={styles.businessNameRow}>
                        <h3 className={styles.businessName}>
                          {business.name}
                        </h3>
                        <span className={`${styles.businessBadge} ${styles[badgeClass]}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className={styles.businessEmail}>{business.email}</p>
                      {business.phone && (
                        <p className={styles.businessPhone}>{business.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className={styles.businessChevron}>
                    <ChevronRight />
                  </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.businessStats}>
                  {[
                    {
                      label: 'Total Bots',
                      value: businessStats.totalBots,
                      color: 'blue',
                    },
                    {
                      label: 'Active Bots',
                      value: businessStats.activeBots,
                      color: 'green',
                    },
                    {
                      label: 'Messages',
                      value: businessStats.totalMessages,
                      color: 'purple',
                    },
                  ].map((stat) => (
                    <div key={stat.label} className={`${styles.businessStat} ${styles[stat.color]}`}>
                      <p className={styles.businessStatLabel}>
                        {stat.label}
                      </p>
                      <p className={`${styles.businessStatValue} ${styles[stat.color]}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className={styles.businessFooter}>
                  <span className={styles.businessFooterLink}>View full analytics</span>
                  <div className={styles.businessFooterIcon}>
                    <ChevronRight />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}