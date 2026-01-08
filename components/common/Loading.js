import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Loading = () => {
  return html`
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  `;
};

export default Loading;
