import React from 'react';
import htm from 'htm';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout.js';

const html = htm.bind(React.createElement);

const Unauthorized = () => {
  const navigate = useNavigate();

  return html`
    <${AuthLayout} title=${null}>
      <div className="text-center space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <i className="fa-solid fa-lock text-red-600 text-2xl"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <p className="text-sm">
            <i className="fa-solid fa-exclamation-triangle mr-2"></i>
            This page requires administrator privileges.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick=${() => navigate('/dashboard')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </button>
          <button
            onClick=${() => navigate(-1)}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    </${AuthLayout}>
  `;
};

export default Unauthorized;
