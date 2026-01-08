import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const UsageProgress = ({ label, used, limit, remaining, icon }) => {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isWarning = percentage >= 80;
  const isDanger = percentage >= 95;

  const barColor = isDanger
    ? 'bg-red-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-blue-500';

  return html`
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <i className=${`fa-solid ${icon} text-slate-400`}></i>
          <span className="text-sm font-bold text-slate-700">${label}</span>
        </div>
        <span className="text-xs font-black text-slate-500">
          ${isUnlimited ? 'Unlimited' : `${used} / ${limit}`}
        </span>
      </div>

      ${!isUnlimited && html`
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className=${`h-full ${barColor} transition-all duration-300 ${isWarning ? 'animate-pulse' : ''}`}
            style=${{ width: `${percentage}%` }}
          ></div>
        </div>

        ${isWarning && html`
          <p className="text-xs font-bold text-amber-600">
            <i className="fa-solid fa-exclamation-triangle mr-1"></i>
            ${isDanger ? 'Limit almost reached!' : 'Usage is high'}
          </p>
        `}
      `}
    </div>
  `;
};

export default UsageProgress;

