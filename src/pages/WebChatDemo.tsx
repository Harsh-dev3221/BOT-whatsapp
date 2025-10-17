/**
 * Web Chat Widget Demo Page
 * 
 * Demonstrates the web chat widget integration
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WebChatWidget } from '../components/WebChatWidget';
import { api } from '../lib/api';

export function WebChatDemo() {
  const [searchParams] = useSearchParams();
  const [botId, setBotId] = useState('');
  const [widgetToken, setWidgetToken] = useState('');
  const [showWidget, setShowWidget] = useState(false);
  const [apiBase, setApiBase] = useState('http://localhost:3000');
  const [primaryColor, setPrimaryColor] = useState('#5A3EF0');
  const [botName, setBotName] = useState('AI Assistant');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-load bot if botId is in URL
  useEffect(() => {
    const urlBotId = searchParams.get('botId');
    if (urlBotId) {
      loadBotData(urlBotId);
    }
  }, [searchParams]);

  const loadBotData = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      // Fetch bot widget settings
      const response: any = await api.getWebBot(id);

      if (response.success && response.bot && response.widget) {
        setBotId(id);
        // Token is now returned (stored in plain text like API keys)
        setWidgetToken(response.widget.token || '');
        setPrimaryColor(response.widget.theme?.primaryColor || '#5A3EF0');
        setBotName(response.widget.theme?.botName || response.bot.name || 'AI Assistant');

        // Auto-start widget if we have token
        if (response.widget.token) {
          setShowWidget(true);
        }
      } else {
        setError('Failed to load bot data. Please enter credentials manually.');
      }
    } catch (err: any) {
      setError('Failed to load bot data. Please enter credentials manually.');
      console.error('Error loading bot:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (botId && widgetToken) {
      setShowWidget(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Web Chat Widget Demo
          </h1>
          <p className="text-lg text-gray-600">
            Test the embeddable chat widget with your bot
          </p>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Widget Configuration
          </h2>

          {/* Loading/Error Messages */}
          {loading && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
              Loading bot data...
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Bot ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot ID
              </label>
              <input
                type="text"
                value={botId}
                onChange={(e) => setBotId(e.target.value)}
                placeholder="Enter your bot ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
              <p className="mt-1 text-sm text-gray-500">
                Get this from your bot dashboard
              </p>
            </div>

            {/* Widget Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Widget Token
              </label>
              <input
                type="text"
                value={widgetToken}
                onChange={(e) => setWidgetToken(e.target.value)}
                placeholder="Enter your widget token"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
              <p className="mt-1 text-sm text-gray-500">
                Get this from bot settings → Web Chat
              </p>
            </div>

            {/* API Base URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Base URL
              </label>
              <input
                type="text"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder="http://localhost:3000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Theme Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    title="Choose primary color"
                    className="w-12 h-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#5A3EF0"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="AI Assistant"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={!botId || !widgetToken}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {showWidget ? 'Widget Active' : 'Start Widget'}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            How to Use
          </h2>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Get Your Bot ID
                </h3>
                <p className="text-gray-600">
                  Navigate to your bot dashboard and copy the bot ID from the settings page.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Generate Widget Token
                </h3>
                <p className="text-gray-600">
                  In bot settings, go to "Web Chat" section and generate a widget token. This token allows the widget to connect to your bot.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Configure & Test
                </h3>
                <p className="text-gray-600">
                  Enter your credentials above, customize the theme, and click "Start Widget" to test the chat interface.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Embed on Your Website
                </h3>
                <p className="text-gray-600">
                  Once tested, copy the embed code from the dashboard and paste it into your website's HTML.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Embed Code Example */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Embed Code Example
          </h2>
          <pre className="text-green-400 text-sm overflow-x-auto">
            {`<script>
  (function(){
    const s = document.createElement('script');
    s.src = 'https://your-cdn.com/webchat.min.js';
    s.async = true;
    s.onload = function(){
      window.BotChat.init({
        botId: '${botId || 'YOUR_BOT_ID'}',
        token: '${widgetToken || 'YOUR_WIDGET_TOKEN'}',
        apiBase: '${apiBase}',
        theme: {
          primaryColor: '${primaryColor}',
          botName: '${botName}'
        }
      });
    };
    document.head.appendChild(s);
  })();
</script>`}
          </pre>
        </div>
      </div>

      {/* Widget */}
      {showWidget && (
        <WebChatWidget
          botId={botId}
          widgetToken={widgetToken}
          apiBase={apiBase}
          theme={{
            primaryColor,
            botName,
          }}
        />
      )}
    </div>
  );
}

