import React from 'react';
import { Helmet } from 'react-helmet-async';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - Nova‑XFinity AI</title>
        <meta name="description" content="Learn about Nova‑XFinity AI, our mission, and how we're revolutionizing SEO content creation with AI-powered tools." />
      </Helmet>
      <main role="main">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-black text-white mb-6">About Nova‑XFinity AI</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 text-lg leading-relaxed mb-6">
              Nova‑XFinity AI is a cutting-edge platform designed to revolutionize SEO content creation 
              through the power of artificial intelligence. Our mission is to empower content creators, 
              marketers, and businesses to produce high-quality, SEO-optimized content at scale.
            </p>
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-slate-300 leading-relaxed">
                We believe that great content should be accessible to everyone. By combining advanced AI 
                technology with intuitive design, we make professional-grade content creation tools available 
                to creators of all skill levels.
              </p>
            </section>
            <section className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">What We Offer</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>AI-powered article generation with SEO optimization</li>
                <li>Media creation and editing tools</li>
                <li>Research assistance for content planning</li>
                <li>WordPress integration for seamless publishing</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default AboutPage;
