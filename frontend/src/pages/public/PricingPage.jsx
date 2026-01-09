import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - Nova‑XFinity AI</title>
        <meta name="description" content="Choose the perfect plan for your content creation needs. Flexible pricing options for individuals and teams." />
      </Helmet>
      <main role="main">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-white mb-4">Pricing Plans</h1>
            <p className="text-slate-300 text-lg">
              Choose the plan that fits your content creation needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                name: 'Starter',
                price: 'Free',
                description: 'Perfect for trying out our platform',
                features: [
                  '5 articles per month',
                  'Basic SEO optimization',
                  'Community support',
                  'Standard templates'
                ],
                cta: 'Get Started',
                highlight: false
              },
              {
                name: 'Professional',
                price: '$29',
                period: '/month',
                description: 'For content creators and small teams',
                features: [
                  'Unlimited articles',
                  'Advanced SEO tools',
                  'Media generation',
                  'Priority support',
                  'WordPress integration'
                ],
                cta: 'Start Free Trial',
                highlight: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large teams and agencies',
                features: [
                  'Everything in Professional',
                  'Custom AI models',
                  'Dedicated support',
                  'API access',
                  'Custom integrations'
                ],
                cta: 'Contact Sales',
                highlight: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`bg-slate-900 rounded-2xl p-8 border ${
                  plan.highlight
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-slate-800'
                }`}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-slate-400 ml-2">{plan.period}</span>
                  )}
                </div>
                <p className="text-slate-300 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-slate-300">
                      <i className="fa-solid fa-check text-blue-500 mr-3 mt-1"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full text-center py-3 px-6 rounded-lg font-bold transition-all ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default PricingPage;
