import React from 'react';
import { Helmet } from 'react-helmet-async';

const DocsPage = () => {
  return (
    <>
      <Helmet>
        <title>Documentation - Nova‑XFinity AI</title>
        <meta name="description" content="Comprehensive documentation for Nova‑XFinity AI. Learn how to use our AI-powered content creation tools, API, and integrations." />
      </Helmet>
      <main role="main">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-black text-white mb-6">Documentation</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Welcome to the Nova‑XFinity AI documentation. Here you'll find guides, API references, 
              and tutorials to help you get the most out of our platform.
            </p>
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                New to Nova‑XFinity AI? Start here to learn the basics of using our platform.
              </p>
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                <h3 className="text-xl font-semibold text-white mb-3">Quick Start Guide</h3>
                <ol className="list-decimal list-inside text-slate-300 space-y-2">
                  <li>Create an account or sign in</li>
                  <li>Navigate to the Dashboard</li>
                  <li>Choose a tool: Article Generator, Media Hub, or Research Assistant</li>
                  <li>Start creating content!</li>
                </ol>
              </div>
            </section>
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">API Documentation</h2>
              <p className="text-slate-300 leading-relaxed">
                Integrate Nova‑XFinity AI into your applications using our RESTful API. 
                Full API documentation is available in your dashboard under Settings → API Access.
              </p>
            </section>
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">WordPress Integration</h2>
              <p className="text-slate-300 leading-relaxed">
                Learn how to connect Nova‑XFinity AI with your WordPress site for seamless 
                content publishing and management.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default DocsPage;
