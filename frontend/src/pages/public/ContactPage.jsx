import React from 'react';
import { Helmet } from 'react-helmet-async';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - Nova‑XFinity AI</title>
        <meta name="description" content="Get in touch with the Nova‑XFinity AI team. We're here to help with questions, support, and feedback." />
      </Helmet>
      <main role="main">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-black text-white mb-6">Contact Us</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Have questions or need support? We'd love to hear from you. Reach out through 
              any of the channels below.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <i className="fa-solid fa-envelope text-blue-500 mr-3"></i>
                  Email Support
                </h3>
                <p className="text-slate-300 mb-4">
                  For general inquiries and support:
                </p>
                <a
                  href="mailto:support@nova-xfinity.ai"
                  className="text-blue-400 hover:text-blue-300"
                >
                  support@nova-xfinity.ai
                </a>
              </div>
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <i className="fa-solid fa-comments text-blue-500 mr-3"></i>
                  Community
                </h3>
                <p className="text-slate-300 mb-4">
                  Join our community for discussions and updates:
                </p>
                <a
                  href="/community"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Visit Community →
                </a>
              </div>
            </div>
            <div className="mt-8 bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">Response Time</h3>
              <p className="text-slate-300">
                We typically respond to all inquiries within 24-48 hours during business days. 
                For urgent matters, please indicate "URGENT" in your subject line.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ContactPage;
