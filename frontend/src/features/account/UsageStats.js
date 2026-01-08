import React from 'react';
import htm from 'htm';
import UsageProgress from './UsageProgress.js';

const html = htm.bind(React.createElement);

const UsageStats = ({ usage }) => {
  if (!usage) return null;

  return html`
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50">
      <h3 className="text-xl font-black text-slate-800 mb-6">Usage Statistics</h3>

      <div className="space-y-6">
        <${UsageProgress}
          label="Articles Generated"
          used=${usage.articles.used}
          limit=${usage.articles.limit}
          remaining=${usage.articles.remaining}
          icon="fa-file-lines"
        />

        <${UsageProgress}
          label="Images Generated"
          used=${usage.images.used}
          limit=${usage.images.limit}
          remaining=${usage.images.remaining}
          icon="fa-image"
        />

        ${usage.videos.limit > 0 && html`
          <${UsageProgress}
            label="Videos Generated"
            used=${usage.videos.used}
            limit=${usage.videos.limit}
            remaining=${usage.videos.remaining}
            icon="fa-video"
          />
        `}

        <${UsageProgress}
          label="Research Queries"
          used=${usage.research.used}
          limit=${usage.research.limit}
          remaining=${usage.research.remaining}
          icon="fa-microscope"
        />

        ${usage.wordpress.limit > 0 && html`
          <${UsageProgress}
            label="WordPress Publications"
            used=${usage.wordpress.used}
            limit=${usage.wordpress.limit}
            remaining=${usage.wordpress.remaining}
            icon="fa-wordpress"
          />
        `}
      </div>
    </div>
  `;
};

export default UsageStats;

