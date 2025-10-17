import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Business } from '../types';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import styles from './BusinessList.module.css';

export default function BusinessList() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    subscription_plan: 'free' | 'basic' | 'pro' | 'enterprise';
  }>({
    name: '',
    email: '',
    phone: '',
    subscription_plan: 'free',
  });

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    setLoading(true);
    const response = await api.getBusinesses();
    if (response.success && response.data) {
      setBusinesses(response.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await api.createBusiness(formData);
    if (response.success) {
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', subscription_plan: 'free' });
      loadBusinesses();
    }
  };

  if (loading) {
    return <LoadingState message="Loading businesses" />;
  }

  return (
    <div className={styles.container}>
      <PageHeader
        title="Businesses"
        subtitle="Manage every tenant, billing plan, and service window in one place."
        actions={(
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={styles.submitButton}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
            </svg>
            New business
          </button>
        )}
      />

      <section className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Tenant directory</h2>
          <p className={styles.sectionDescription}>Stay on top of onboarding, subscription plans, and contact details</p>
        </div>

        <div className={styles.businessGrid}>
          {businesses.map((business) => (
            <article key={business.id} className={styles.businessCard}>
              <div className={styles.cardHeader}>
                <div className={styles.businessInfo}>
                  <div className={styles.avatar}>
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.details}>
                    <h3 className={styles.name}>{business.name}</h3>
                    <p className={styles.email}>{business.email}</p>
                    <p className={styles.phone}>{business.phone}</p>
                  </div>
                </div>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${styles[business.subscription_status]}`}>
                    {business.subscription_status}
                  </span>
                  <span className={`${styles.badge} ${styles[business.subscription_plan]}`}>
                    {business.subscription_plan}
                  </span>
                </div>
              </div>

              <div className={styles.statsGrid}>
                {[
                  {
                    label: 'Trial ends',
                    value: business.trial_ends_at ? new Date(business.trial_ends_at).toLocaleDateString() : 'Not set',
                  },
                  {
                    label: 'Created',
                    value: new Date(business.created_at).toLocaleDateString(),
                  },
                  {
                    label: 'Last updated',
                    value: new Date(business.updated_at).toLocaleDateString(),
                  },
                ].map((item) => (
                  <div key={item.label} className={styles.statBox}>
                    <p className={styles.statLabel}>{item.label}</p>
                    <p className={styles.statValue}>{item.value}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
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
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className={styles.modalTitle}>Add new business</h2>
            <p className={styles.modalSubtitle}>Create a tenant profile to unlock bot provisioning and analytics.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Business name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.input}
                  placeholder="Acme Corp"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.input}
                  placeholder="team@acme.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={styles.input}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Plan</label>
                <select
                  value={formData.subscription_plan}
                  onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value as 'free' | 'basic' | 'pro' | 'enterprise' })}
                  aria-label="Select subscription plan"
                  className={styles.select}
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className={styles.formButtons}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Create business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

