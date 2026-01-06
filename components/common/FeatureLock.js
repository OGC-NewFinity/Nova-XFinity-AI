import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const FeatureLock = ({ plan, feature, children, onUpgrade }) => {
  const planNames = {
    FREE: 'Free',
    PRO: 'Pro',
    ENTERPRISE: 'Enterprise'
  };

  const upgradeMessage = plan === 'FREE' 
    ? 'Upgrade to Pro to unlock this feature'
    : `Upgrade to Enterprise to unlock this feature`;

  return html`
    <div className="relative group">
      ${children}
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="text-center p-6">
          <i className="fa-solid fa-lock text-4xl text-blue-400 mb-4"></i>
          <p className="text-white font-bold text-sm mb-2">Feature Locked</p>
          <p className="text-slate-300 text-xs mb-4">${upgradeMessage}</p>
          <button
            onClick=${onUpgrade}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  `;
};

export default FeatureLock;
