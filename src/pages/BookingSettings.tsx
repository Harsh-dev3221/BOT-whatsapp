import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getDayName,
  formatTime,
  DAYS_OF_WEEK,
  type Service,
  type TimeSlot,
  type CreateServiceData,
  type CreateTimeSlotData,
} from '../lib/booking-api';
import LoadingState from '../components/LoadingState';
import PageHeader from '../components/PageHeader';
import styles from './BookingSettings.module.css';

export default function BookingSettings() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'services' | 'timeslots'>('services');
  const [loading, setLoading] = useState(true);

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<CreateServiceData>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: '',
    display_order: 0,
  });

  // Time slots state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [timeSlotForm, setTimeSlotForm] = useState<CreateTimeSlotData>({
    day_of_week: 1,
    start_time: '10:00',
    end_time: '20:00',
    slot_duration: 30,
  });

  useEffect(() => {
    if (businessId) {
      loadData();
    }
  }, [businessId]);

  const loadData = async () => {
    if (!businessId) return;

    setLoading(true);
    try {
      const [servicesData, timeSlotsData] = await Promise.all([
        getServices(businessId),
        getTimeSlots(businessId),
      ]);
      setServices(servicesData);
      setTimeSlots(timeSlotsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // ============================================
  // SERVICES HANDLERS
  // ============================================

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    try {
      if (editingService) {
        await updateService(businessId, editingService.id, serviceForm);
      } else {
        await createService(businessId, serviceForm);
      }
      setShowServiceModal(false);
      setEditingService(null);
      resetServiceForm();
      loadData();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description || '',
      price: service.price || 0,
      duration: service.duration,
      category: service.category || '',
      display_order: service.display_order,
    });
    setShowServiceModal(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!businessId) return;
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      await deleteService(businessId, serviceId);
      loadData();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleToggleServiceActive = async (service: Service) => {
    if (!businessId) return;

    try {
      await updateService(businessId, service.id, { is_active: !service.is_active });
      loadData();
    } catch (error) {
      console.error('Error toggling service:', error);
      alert('Failed to toggle service');
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      category: '',
      display_order: 0,
    });
  };

  // ============================================
  // TIME SLOTS HANDLERS
  // ============================================

  const handleTimeSlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;

    try {
      const formData = {
        ...timeSlotForm,
        start_time: `${timeSlotForm.start_time}:00`,
        end_time: `${timeSlotForm.end_time}:00`,
      };

      if (editingTimeSlot) {
        await updateTimeSlot(businessId, editingTimeSlot.id, formData);
      } else {
        await createTimeSlot(businessId, formData);
      }
      setShowTimeSlotModal(false);
      setEditingTimeSlot(null);
      resetTimeSlotForm();
      loadData();
    } catch (error) {
      console.error('Error saving time slot:', error);
      alert('Failed to save time slot');
    }
  };

  const handleEditTimeSlot = (slot: TimeSlot) => {
    setEditingTimeSlot(slot);
    setTimeSlotForm({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time.substring(0, 5),
      end_time: slot.end_time.substring(0, 5),
      slot_duration: slot.slot_duration,
    });
    setShowTimeSlotModal(true);
  };

  const handleDeleteTimeSlot = async (slotId: string) => {
    if (!businessId) return;
    if (!confirm('Are you sure you want to delete this time slot?')) return;

    try {
      await deleteTimeSlot(businessId, slotId);
      loadData();
    } catch (error) {
      console.error('Error deleting time slot:', error);
      alert('Failed to delete time slot');
    }
  };

  const handleToggleTimeSlotActive = async (slot: TimeSlot) => {
    if (!businessId) return;

    try {
      await updateTimeSlot(businessId, slot.id, { is_active: !slot.is_active });
      loadData();
    } catch (error) {
      console.error('Error toggling time slot:', error);
      alert('Failed to toggle time slot');
    }
  };

  const resetTimeSlotForm = () => {
    setTimeSlotForm({
      day_of_week: 1,
      start_time: '10:00',
      end_time: '20:00',
      slot_duration: 30,
    });
  };

  if (loading) return <LoadingState />;

  return (
    <div className={styles.container}>
      <PageHeader
        title="Booking Settings"
        subtitle="Manage services and time slots for your business"
        actions={
          <button
            className={styles.backButton}
            onClick={() => navigate('/bots')}
          >
            Back to Bots
          </button>
        }
      />

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'services' ? styles.active : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'timeslots' ? styles.active : ''}`}
          onClick={() => setActiveTab('timeslots')}
        >
          Time Slots
        </button>
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className={styles.tabContent}>
          <div className={styles.header}>
            <h2>Services Menu</h2>
            <button
              className={styles.addButton}
              onClick={() => {
                setEditingService(null);
                resetServiceForm();
                setShowServiceModal(true);
              }}
            >
              + Add Service
            </button>
          </div>

          {services.length === 0 ? (
            <div className={styles.empty}>
              <p>No services added yet. Add your first service to get started!</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {services.map((service) => (
                <div key={service.id} className={`${styles.card} ${!service.is_active ? styles.inactive : ''}`}>
                  <div className={styles.cardHeader}>
                    <h3>{service.name}</h3>
                    <span className={`${styles.badge} ${service.is_active ? styles.active : styles.inactive}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {service.description && <p className={styles.description}>{service.description}</p>}
                  <div className={styles.details}>
                    {service.price && <span className={styles.price}>₹{service.price}</span>}
                    <span className={styles.duration}>{service.duration} min</span>
                    {service.category && <span className={styles.category}>{service.category}</span>}
                  </div>
                  <div className={styles.actions}>
                    <button onClick={() => handleEditService(service)}>Edit</button>
                    <button onClick={() => handleToggleServiceActive(service)}>
                      {service.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDeleteService(service.id)} className={styles.danger}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Time Slots Tab */}
      {activeTab === 'timeslots' && (
        <div className={styles.tabContent}>
          <div className={styles.header}>
            <h2>Working Hours</h2>
            <button
              className={styles.addButton}
              onClick={() => {
                setEditingTimeSlot(null);
                resetTimeSlotForm();
                setShowTimeSlotModal(true);
              }}
            >
              + Add Time Slot
            </button>
          </div>

          {timeSlots.length === 0 ? (
            <div className={styles.empty}>
              <p>No time slots configured. Add working hours to enable bookings!</p>
            </div>
          ) : (
            <div className={styles.list}>
              {timeSlots.map((slot) => (
                <div key={slot.id} className={`${styles.listItem} ${!slot.is_active ? styles.inactive : ''}`}>
                  <div className={styles.slotInfo}>
                    <h3>{getDayName(slot.day_of_week)}</h3>
                    <p>
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </p>
                    <span className={styles.slotDuration}>Slot: {slot.slot_duration} min</span>
                  </div>
                  <div className={styles.slotActions}>
                    <span className={`${styles.badge} ${slot.is_active ? styles.active : styles.inactive}`}>
                      {slot.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button onClick={() => handleEditTimeSlot(slot)}>Edit</button>
                    <button onClick={() => handleToggleTimeSlotActive(slot)}>
                      {slot.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDeleteTimeSlot(slot.id)} className={styles.danger}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingService ? 'Edit Service' : 'Add Service'}</h2>
            <form onSubmit={handleServiceSubmit}>
              <div className={styles.formGroup}>
                <label>Service Name *</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  required
                  aria-label="Service Name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={3}
                  placeholder="Enter service description"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    aria-label="Price in Rupees"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    value={serviceForm.duration}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) })}
                    required
                    min="1"
                    aria-label="Duration in minutes"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <input
                    type="text"
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    placeholder="e.g., Hair, Nails, Skin"
                    aria-label="Service Category"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={serviceForm.display_order}
                    onChange={(e) => setServiceForm({ ...serviceForm, display_order: parseInt(e.target.value) })}
                    min="0"
                    aria-label="Display Order"
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowServiceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primary}>
                  {editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Time Slot Modal */}
      {showTimeSlotModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingTimeSlot ? 'Edit Time Slot' : 'Add Time Slot'}</h2>
            <form onSubmit={handleTimeSlotSubmit}>
              <div className={styles.formGroup}>
                <label>Day of Week *</label>
                <select
                  value={timeSlotForm.day_of_week}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, day_of_week: parseInt(e.target.value) })}
                  required
                  aria-label="Day of Week"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={timeSlotForm.start_time}
                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, start_time: e.target.value })}
                    required
                    aria-label="Start Time"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>End Time *</label>
                  <input
                    type="time"
                    value={timeSlotForm.end_time}
                    onChange={(e) => setTimeSlotForm({ ...timeSlotForm, end_time: e.target.value })}
                    required
                    aria-label="End Time"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Slot Duration (minutes) *</label>
                <input
                  type="number"
                  value={timeSlotForm.slot_duration}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, slot_duration: parseInt(e.target.value) })}
                  required
                  min="1"
                  aria-label="Slot Duration in minutes"
                />
                <small>How long each booking slot should be</small>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowTimeSlotModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primary}>
                  {editingTimeSlot ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

