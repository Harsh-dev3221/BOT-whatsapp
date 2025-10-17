import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BotSettings.module.css';

interface Bot {
  id: string;
  name: string;
  phone_number: string;
  status: string;
}

interface AIContext {
  business_context: string;
  system_prompt: string | null;
  allowed_topics: string[];
  restricted_topics: string[];
  response_style: 'professional' | 'friendly' | 'casual' | 'formal';
  max_response_length: number;
}

interface BotMedia {
  id: string;
  media_type: 'image' | 'video' | 'document' | 'location' | 'contact';
  title: string | null;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  location_name: string | null;
  location_address: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  is_required: boolean;
  is_active: boolean;
}

export default function BotSettings() {
  const { botId } = useParams<{ botId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'context' | 'media'>('context');
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // AI Context state
  const [aiContext, setAIContext] = useState<AIContext>({
    business_context: '',
    system_prompt: null,
    allowed_topics: [],
    restricted_topics: [],
    response_style: 'professional',
    max_response_length: 500,
  });
  const [newAllowedTopic, setNewAllowedTopic] = useState('');
  const [newRestrictedTopic, setNewRestrictedTopic] = useState('');

  // Media state
  const [mediaList, setMediaList] = useState<BotMedia[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<BotMedia | null>(null);
  const [mediaForm, setMediaForm] = useState({
    media_type: 'location' as 'image' | 'video' | 'document' | 'location' | 'contact',
    title: '',
    description: '',
    file_url: '',
    file_name: '',
    location_name: '',
    location_address: '',
    location_latitude: '',
    location_longitude: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    is_required: false,
    is_active: true,
  });

  useEffect(() => {
    if (botId) {
      fetchBot();
      fetchAIContext();
      fetchMedia();
    }
  }, [botId]);

  const fetchBot = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/bots/${botId}`);
      if (response.ok) {
        const data = await response.json();
        setBot(data.bot);
      }
    } catch (error) {
      console.error('Error fetching bot:', error);
    }
  };

  const getDefaultRestrictedTopics = () => {
    return [
      'politics',
      'religion',
      'personal opinions',
      'medical advice',
      'legal advice',
      'financial advice',
      'controversial topics',
      'personal life',
      'gossip',
      'rumors',
    ];
  };

  const fetchAIContext = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/bots/${botId}/context`);
      if (response.ok) {
        const data = await response.json();
        if (data.context) {
          setAIContext({
            business_context: data.context.business_context || '',
            system_prompt: data.context.system_prompt || null,
            allowed_topics: data.context.allowed_topics || [],
            restricted_topics: data.context.restricted_topics || getDefaultRestrictedTopics(),
            response_style: data.context.response_style || 'professional',
            max_response_length: data.context.max_response_length || 500,
          });
        } else {
          // No context exists yet - set defaults
          setAIContext({
            business_context: '',
            system_prompt: null,
            allowed_topics: [],
            restricted_topics: getDefaultRestrictedTopics(),
            response_style: 'professional',
            max_response_length: 500,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching AI context:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedia = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/bots/${botId}/media`);
      if (response.ok) {
        const data = await response.json();
        setMediaList(data.media || []);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const saveAIContext = async () => {
    try {
      setSaving(true);
      const response = await fetch(`http://localhost:3000/api/bots/${botId}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiContext),
      });

      if (response.ok) {
        alert('AI Context saved successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving AI context:', error);
      alert('Failed to save AI context');
    } finally {
      setSaving(false);
    }
  };

  const addAllowedTopic = () => {
    if (newAllowedTopic.trim()) {
      setAIContext({
        ...aiContext,
        allowed_topics: [...aiContext.allowed_topics, newAllowedTopic.trim()],
      });
      setNewAllowedTopic('');
    }
  };

  const removeAllowedTopic = (topic: string) => {
    setAIContext({
      ...aiContext,
      allowed_topics: aiContext.allowed_topics.filter((t) => t !== topic),
    });
  };

  const addRestrictedTopic = () => {
    if (newRestrictedTopic.trim()) {
      setAIContext({
        ...aiContext,
        restricted_topics: [...aiContext.restricted_topics, newRestrictedTopic.trim()],
      });
      setNewRestrictedTopic('');
    }
  };

  const removeRestrictedTopic = (topic: string) => {
    setAIContext({
      ...aiContext,
      restricted_topics: aiContext.restricted_topics.filter((t) => t !== topic),
    });
  };

  const openMediaModal = (media?: BotMedia) => {
    if (media) {
      setEditingMedia(media);
      setMediaForm({
        media_type: media.media_type,
        title: media.title || '',
        description: media.description || '',
        file_url: media.file_url || '',
        file_name: media.file_name || '',
        location_name: media.location_name || '',
        location_address: media.location_address || '',
        location_latitude: media.location_latitude?.toString() || '',
        location_longitude: media.location_longitude?.toString() || '',
        contact_name: media.contact_name || '',
        contact_phone: media.contact_phone || '',
        contact_email: media.contact_email || '',
        is_required: media.is_required,
        is_active: media.is_active,
      });
    } else {
      setEditingMedia(null);
      setMediaForm({
        media_type: 'location',
        title: '',
        description: '',
        file_url: '',
        file_name: '',
        location_name: '',
        location_address: '',
        location_latitude: '',
        location_longitude: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        is_required: false,
        is_active: true,
      });
    }
    setShowMediaModal(true);
  };

  const closeMediaModal = () => {
    setShowMediaModal(false);
    setEditingMedia(null);
  };

  const saveMedia = async () => {
    try {
      const payload: any = {
        media_type: mediaForm.media_type,
        title: mediaForm.title || null,
        description: mediaForm.description || null,
        is_required: mediaForm.is_required,
        is_active: mediaForm.is_active,
      };

      if (mediaForm.media_type === 'location') {
        payload.location_name = mediaForm.location_name || null;
        payload.location_address = mediaForm.location_address || null;
        payload.location_latitude = mediaForm.location_latitude ? parseFloat(mediaForm.location_latitude) : null;
        payload.location_longitude = mediaForm.location_longitude ? parseFloat(mediaForm.location_longitude) : null;
      } else if (mediaForm.media_type === 'contact') {
        payload.contact_name = mediaForm.contact_name || null;
        payload.contact_phone = mediaForm.contact_phone || null;
        payload.contact_email = mediaForm.contact_email || null;
      } else {
        payload.file_url = mediaForm.file_url || null;
        payload.file_name = mediaForm.file_name || null;
      }

      const url = editingMedia
        ? `http://localhost:3000/api/bots/${botId}/media/${editingMedia.id}`
        : `http://localhost:3000/api/bots/${botId}/media`;

      const response = await fetch(url, {
        method: editingMedia ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Media saved successfully!');
        closeMediaModal();
        fetchMedia();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving media:', error);
      alert('Failed to save media');
    }
  };

  const deleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/bots/${botId}/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Media deleted successfully!');
        fetchMedia();
      } else {
        alert('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/bots')}>
          ← Back to Bots
        </button>
        <h1>Bot Settings: {bot?.name}</h1>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'context' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('context')}
        >
          AI Context
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'media' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('media')}
        >
          Media Library
        </button>
      </div>

      {activeTab === 'context' && (
        <div className={styles.content}>
          <div className={styles.section}>
            <h2>Business Context (Required)</h2>
            <p className={styles.help}>
              Describe your business in detail. This helps the AI understand your business and respond appropriately.
            </p>
            <textarea
              className={styles.textarea}
              value={aiContext.business_context}
              onChange={(e) => setAIContext({ ...aiContext, business_context: e.target.value })}
              placeholder="Example: We are a professional hair salon specializing in modern haircuts, hair coloring, and styling services. We have experienced stylists and use premium products."
              rows={5}
              required
            />
          </div>

          <div className={styles.section}>
            <h2>System Prompt (Optional)</h2>
            <p className={styles.help}>
              Custom instructions for the AI. Leave empty to use auto-generated prompt.
            </p>
            <textarea
              className={styles.textarea}
              value={aiContext.system_prompt || ''}
              onChange={(e) => setAIContext({ ...aiContext, system_prompt: e.target.value || null })}
              placeholder="Custom AI instructions..."
              rows={4}
            />
          </div>

          <div className={styles.section}>
            <h2>Allowed Topics</h2>
            <p className={styles.help}>Topics the bot can discuss with customers.</p>
            <div className={styles.topicInput}>
              <input
                type="text"
                value={newAllowedTopic}
                onChange={(e) => setNewAllowedTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAllowedTopic()}
                placeholder="Add topic (e.g., services, booking, pricing)"
              />
              <button onClick={addAllowedTopic}>Add</button>
            </div>
            <div className={styles.topicList}>
              {aiContext.allowed_topics.map((topic) => (
                <span key={topic} className={styles.topicTag}>
                  {topic}
                  <button onClick={() => removeAllowedTopic(topic)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2>Restricted Topics</h2>
            <p className={styles.help}>Topics the bot should NOT discuss.</p>
            <div className={styles.topicInput}>
              <input
                type="text"
                value={newRestrictedTopic}
                onChange={(e) => setNewRestrictedTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRestrictedTopic()}
                placeholder="Add topic (e.g., politics, religion)"
              />
              <button onClick={addRestrictedTopic}>Add</button>
            </div>
            <div className={styles.topicList}>
              {aiContext.restricted_topics.map((topic) => (
                <span key={topic} className={`${styles.topicTag} ${styles.restrictedTag}`}>
                  {topic}
                  <button onClick={() => removeRestrictedTopic(topic)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.section}>
              <h2>Response Style</h2>
              <select
                className={styles.select}
                value={aiContext.response_style}
                onChange={(e) =>
                  setAIContext({
                    ...aiContext,
                    response_style: e.target.value as AIContext['response_style'],
                  })
                }
                aria-label="Response Style"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </select>
            </div>

            <div className={styles.section}>
              <h2>Max Response Length</h2>
              <input
                type="number"
                className={styles.input}
                value={aiContext.max_response_length}
                onChange={(e) =>
                  setAIContext({ ...aiContext, max_response_length: parseInt(e.target.value) || 500 })
                }
                min={100}
                max={2000}
                aria-label="Max Response Length"
              />
              <p className={styles.help}>Characters (100-2000)</p>
            </div>
          </div>

          <button className={styles.saveButton} onClick={saveAIContext} disabled={saving || !aiContext.business_context}>
            {saving ? 'Saving...' : 'Save AI Context'}
          </button>
        </div>
      )}

      {activeTab === 'media' && (
        <div className={styles.content}>
          <div className={styles.mediaHeader}>
            <h2>Media Library</h2>
            <button className={styles.addButton} onClick={() => openMediaModal()}>
              + Add Media
            </button>
          </div>

          <div className={styles.mediaGrid}>
            {mediaList.map((media) => (
              <div key={media.id} className={styles.mediaCard}>
                <div className={styles.mediaType}>{media.media_type.toUpperCase()}</div>
                <h3>{media.title || 'Untitled'}</h3>
                <p>{media.description || 'No description'}</p>
                {media.media_type === 'location' && (
                  <div className={styles.mediaDetails}>
                    <p>📍 {media.location_address}</p>
                  </div>
                )}
                {media.media_type === 'contact' && (
                  <div className={styles.mediaDetails}>
                    <p>👤 {media.contact_name}</p>
                    <p>📞 {media.contact_phone}</p>
                  </div>
                )}
                <div className={styles.mediaActions}>
                  <label>
                    <input
                      type="checkbox"
                      checked={media.is_active}
                      onChange={async () => {
                        await fetch(`http://localhost:3000/api/bots/${botId}/media/${media.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ is_active: !media.is_active }),
                        });
                        fetchMedia();
                      }}
                    />
                    Active
                  </label>
                  <button onClick={() => openMediaModal(media)}>Edit</button>
                  <button onClick={() => deleteMedia(media.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {mediaList.length === 0 && (
            <div className={styles.emptyState}>
              <p>No media added yet. Click "Add Media" to get started.</p>
            </div>
          )}
        </div>
      )}

      {showMediaModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingMedia ? 'Edit Media' : 'Add Media'}</h2>

            <div className={styles.formGroup}>
              <label>Media Type</label>
              <select
                value={mediaForm.media_type}
                onChange={(e) => setMediaForm({ ...mediaForm, media_type: e.target.value as any })}
                disabled={!!editingMedia}
                aria-label="Media Type"
              >
                <option value="location">Location</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="contact">Contact</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Title</label>
              <input
                type="text"
                value={mediaForm.title}
                onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                placeholder="Media title"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={mediaForm.description}
                onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })}
                placeholder="Media description"
                rows={3}
              />
            </div>

            {mediaForm.media_type === 'location' && (
              <>
                <div className={styles.formGroup}>
                  <label>Location Name</label>
                  <input
                    type="text"
                    value={mediaForm.location_name}
                    onChange={(e) => setMediaForm({ ...mediaForm, location_name: e.target.value })}
                    placeholder="Our Salon"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Address</label>
                  <input
                    type="text"
                    value={mediaForm.location_address}
                    onChange={(e) => setMediaForm({ ...mediaForm, location_address: e.target.value })}
                    placeholder="123 Main St, Mumbai"
                  />
                </div>
                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={mediaForm.location_latitude}
                      onChange={(e) => setMediaForm({ ...mediaForm, location_latitude: e.target.value })}
                      placeholder="19.0760"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={mediaForm.location_longitude}
                      onChange={(e) => setMediaForm({ ...mediaForm, location_longitude: e.target.value })}
                      placeholder="72.8777"
                    />
                  </div>
                </div>
              </>
            )}

            {mediaForm.media_type === 'contact' && (
              <>
                <div className={styles.formGroup}>
                  <label>Contact Name</label>
                  <input
                    type="text"
                    value={mediaForm.contact_name}
                    onChange={(e) => setMediaForm({ ...mediaForm, contact_name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={mediaForm.contact_phone}
                    onChange={(e) => setMediaForm({ ...mediaForm, contact_phone: e.target.value })}
                    placeholder="+919876543210"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={mediaForm.contact_email}
                    onChange={(e) => setMediaForm({ ...mediaForm, contact_email: e.target.value })}
                    placeholder="contact@example.com"
                  />
                </div>
              </>
            )}

            {['image', 'video', 'document'].includes(mediaForm.media_type) && (
              <>
                <div className={styles.formGroup}>
                  <label>File URL</label>
                  <input
                    type="url"
                    value={mediaForm.file_url}
                    onChange={(e) => setMediaForm({ ...mediaForm, file_url: e.target.value })}
                    placeholder="https://example.com/file.jpg"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>File Name</label>
                  <input
                    type="text"
                    value={mediaForm.file_name}
                    onChange={(e) => setMediaForm({ ...mediaForm, file_name: e.target.value })}
                    placeholder="file.jpg"
                  />
                </div>
              </>
            )}

            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={mediaForm.is_required}
                  onChange={(e) => setMediaForm({ ...mediaForm, is_required: e.target.checked })}
                />
                Required
              </label>
            </div>

            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={mediaForm.is_active}
                  onChange={(e) => setMediaForm({ ...mediaForm, is_active: e.target.checked })}
                />
                Active
              </label>
            </div>

            <div className={styles.modalActions}>
              <button onClick={closeMediaModal}>Cancel</button>
              <button onClick={saveMedia} className={styles.saveButton}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

