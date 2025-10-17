import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { BotDashboardAuth, Booking, BookingStats, CustomerAnalytics, BookingTrend } from '../types';
import LoadingState from '../components/LoadingState';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  LogOut
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import styles from './BotDashboard.module.css';

export default function BotDashboard() {
  const { botId } = useParams<{ botId: string }>();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authData, setAuthData] = useState<BotDashboardAuth | null>(null);
  const [authHeader, setAuthHeader] = useState<string>('');

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard data state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [trends, setTrends] = useState<BookingTrend[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Check for existing session
  useEffect(() => {
    const savedAuth = localStorage.getItem(`bot_dashboard_${botId}`);
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setAuthData(parsed.authData);
        setAuthHeader(parsed.authHeader);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem(`bot_dashboard_${botId}`);
      }
    }
  }, [botId]);

  // Load dashboard data when authenticated
  useEffect(() => {
    if (isAuthenticated && authHeader) {
      loadDashboardData();
    }
  }, [isAuthenticated, authHeader, statusFilter, searchQuery]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const response = await api.botDashboardLogin(botId!, username, password);

      if (response.success && response.data) {
        const auth = `Basic ${btoa(`${username}:${password}`)}`;
        setAuthData(response.data);
        setAuthHeader(auth);
        setIsAuthenticated(true);

        // Save to localStorage
        localStorage.setItem(`bot_dashboard_${botId}`, JSON.stringify({
          authData: response.data,
          authHeader: auth,
        }));
      } else {
        setLoginError(response.error || 'Login failed');
      }
    } catch (error: any) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`bot_dashboard_${botId}`);
    setIsAuthenticated(false);
    setAuthData(null);
    setAuthHeader('');
    setUsername('');
    setPassword('');
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [bookingsRes, statsRes, analyticsRes, trendsRes] = await Promise.all([
        api.getBotBookings(botId!, authHeader, {
          status: statusFilter || undefined,
          search: searchQuery || undefined,
        }),
        api.getBotBookingStats(botId!, authHeader),
        api.getBotCustomerAnalytics(botId!, authHeader),
        api.getBotBookingTrends(botId!, authHeader, 30),
      ]);

      console.log('Bookings response:', bookingsRes);

      if (bookingsRes.success && bookingsRes.data) {
        // Backend returns { success: true, data: { data: bookings[], pagination: {...} } }
        // So bookingsRes.data.data is the array of bookings
        setBookings(bookingsRes.data.data || []);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (analyticsRes.success && analyticsRes.data) {
        setCustomerAnalytics(analyticsRes.data);
      }
      if (trendsRes.success && trendsRes.data) {
        setTrends(trendsRes.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await api.updateBookingStatus(botId!, bookingId, newStatus, undefined, authHeader);
      if (response.success) {
        // Reload bookings
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <h1>Bot Dashboard Login</h1>
            <p>Enter your bot credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Username (Bot Phone Number)</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter bot phone number"
                required
                disabled={isLoggingIn}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={isLoggingIn}
              />
            </div>

            {loginError && (
              <div className={styles.errorMessage}>
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className={styles.loginButton}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  if (loading && !stats) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444',
    no_show: '#6b7280',
  };

  const pieData = stats ? [
    { name: 'Pending', value: stats.pending, color: statusColors.pending },
    { name: 'Confirmed', value: stats.confirmed, color: statusColors.confirmed },
    { name: 'Completed', value: stats.completed, color: statusColors.completed },
    { name: 'Cancelled', value: stats.cancelled, color: statusColors.cancelled },
  ] : [];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>{authData?.botName} Dashboard</h1>
          <p className={styles.subtitle}>Manage your bookings and view analytics</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
              <Calendar size={24} color="#3b82f6" />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Bookings</p>
              <p className={styles.statValue}>{stats.total}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
              <Clock size={24} color="#f59e0b" />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Pending</p>
              <p className={styles.statValue}>{stats.pending}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: '#d1fae5' }}>
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Completed</p>
              <p className={styles.statValue}>{stats.completed}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: '#e0e7ff' }}>
              <DollarSign size={24} color="#6366f1" />
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Revenue</p>
              <p className={styles.statValue}>${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Booking Trends */}
        <div className={styles.chartCard}>
          <h3>Booking Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
              <Line type="monotone" dataKey="cancelled" stroke="#ef4444" name="Cancelled" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className={styles.chartCard}>
          <h3>Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Analytics */}
      {customerAnalytics && (
        <div className={styles.analyticsSection}>
          <h2>Customer Analytics</h2>
          <div className={styles.analyticsGrid}>
            <div className={styles.analyticsCard}>
              <Users size={32} color="#3b82f6" />
              <div>
                <p className={styles.analyticsLabel}>Total Customers</p>
                <p className={styles.analyticsValue}>{customerAnalytics.totalCustomers}</p>
              </div>
            </div>
            <div className={styles.analyticsCard}>
              <TrendingUp size={32} color="#10b981" />
              <div>
                <p className={styles.analyticsLabel}>Repeat Customers</p>
                <p className={styles.analyticsValue}>{customerAnalytics.repeatCustomers}</p>
              </div>
            </div>
            <div className={styles.analyticsCard}>
              <BarChart3 size={32} color="#f59e0b" />
              <div>
                <p className={styles.analyticsLabel}>Retention Rate</p>
                <p className={styles.analyticsValue}>{customerAnalytics.retentionRate}%</p>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className={styles.topCustomers}>
            <h3>Top Customers</h3>
            <div className={styles.customerList}>
              {customerAnalytics.topCustomers.map((customer, index) => (
                <div key={customer.customerPhone} className={styles.customerItem}>
                  <div className={styles.customerRank}>{index + 1}</div>
                  <div className={styles.customerInfo}>
                    <p className={styles.customerName}>{customer.customerName}</p>
                    <p className={styles.customerPhone}>{customer.customerPhone}</p>
                  </div>
                  <div className={styles.customerStats}>
                    <span className={styles.customerBookings}>{customer.totalBookings} bookings</span>
                    <span className={styles.customerCompleted}>{customer.completedBookings} completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className={styles.bookingsSection}>
        <div className={styles.bookingsHeader}>
          <h2>Bookings</h2>
          <div className={styles.filters}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>

            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.bookingsList}>
          {!bookings || bookings.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar size={48} color="#9ca3af" />
              <p>No bookings found</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.bookingCustomer}>
                    <User size={20} />
                    <div>
                      <p className={styles.bookingName}>{booking.customer_name}</p>
                      <p className={styles.bookingPhone}>{booking.customer_phone}</p>
                    </div>
                  </div>
                  <div
                    className={styles.bookingStatus}
                    style={{ backgroundColor: statusColors[booking.status] }}
                  >
                    {booking.status}
                  </div>
                </div>

                <div className={styles.bookingDetails}>
                  <div className={styles.bookingDetail}>
                    <Calendar size={16} />
                    <span>{booking.booking_date}</span>
                  </div>
                  <div className={styles.bookingDetail}>
                    <Clock size={16} />
                    <span>{booking.booking_time}</span>
                  </div>
                  <div className={styles.bookingDetail}>
                    <span className={styles.serviceName}>{booking.service_name}</span>
                  </div>
                  {booking.service_price && (
                    <div className={styles.bookingDetail}>
                      <DollarSign size={16} />
                      <span>${booking.service_price}</span>
                    </div>
                  )}
                </div>

                {booking.status === 'pending' && (
                  <div className={styles.bookingActions}>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                      className={styles.actionButton}
                      style={{ backgroundColor: '#3b82f6' }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className={styles.actionButton}
                      style={{ backgroundColor: '#ef4444' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className={styles.bookingActions}>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                      className={styles.actionButton}
                      style={{ backgroundColor: '#10b981' }}
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'no_show')}
                      className={styles.actionButton}
                      style={{ backgroundColor: '#6b7280' }}
                    >
                      No Show
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

