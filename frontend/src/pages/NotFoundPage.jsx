import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found - Nova‑XFinity AI</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>
      <main role="main" className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-black text-white mb-4">404</h1>
          <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
          <p className="text-slate-300 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
            >
              Go Home
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFoundPage;
