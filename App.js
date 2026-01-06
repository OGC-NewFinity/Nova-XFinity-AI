
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import Sidebar from './components/Sidebar.js';
import Dashboard from './components/Dashboard.js';
import Writer from './components/writer/Writer.js';
import Research from './components/Research.js';
import MediaHub from './components/MediaHub.js';
import AccountPage from './components/Account/AccountPage.js';
import SettingsPanel from './components/Settings/SettingsPanel.js';
import NotificationManager from './components/common/Notification.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('finity_settings');
    return saved ? JSON.parse(saved) : {
      apiContext: '************************',
      provider: 'gemini',
      focusKeyphrase: '',
      openaiKey: '',
      claudeKey: '',
      llamaKey: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('finity_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSaveSettings = () => {
    alert('Finity Agent Configuration synchronized successfully.');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return html`<${Dashboard} />`;
      case 'writer': return html`<${Writer} settings=${settings} />`;
      case 'research': return html`<${Research} />`;
      case 'mediahub': return html`<${MediaHub} />`;
      case 'account': return html`<${AccountPage} />`;
      case 'settings': return html`<${SettingsPanel} settings=${settings} onSettingsChange=${setSettings} onSave=${handleSaveSettings} />`;
      default: return html`<${Dashboard} />`;
    }
  };

  return html`
    <div className="flex min-h-screen bg-gray-50 selection:bg-blue-100 selection:text-blue-900">
      <${Sidebar} activeTab=${activeTab} setActiveTab=${setActiveTab} />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          ${renderContent()}
        </div>
      </main>
      <${NotificationManager} />
    </div>
  `;
};

export default App;
