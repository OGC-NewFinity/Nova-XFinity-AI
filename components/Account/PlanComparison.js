import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const PlanComparison = ({ currentPlan, onUpgrade }) => {
  const plans = [
    {
      name: 'FREE',
      price: '$0',
      features: [
        '10 articles/month',
        '25 images/month',
        '20 research queries/month',
        'Basic SEO features',
        'Standard quality'
      ]
    },
    {
      name: 'PRO',
      price: '$29',
      pricePeriod: '/month',
      features: [
        '100 articles/month',
        '500 images/month',
        '20 videos/month',
        'Unlimited research',
        '50 WordPress publications',
        'Advanced SEO features',
        'High-quality content',
        'API access',
        'Priority support'
      ],
      popular: true
    },
    {
      name: 'ENTERPRISE',
      price: '$99',
      pricePeriod: '/month',
      features: [
        'Unlimited articles',
        'Unlimited images',
        '100 videos/month',
        'Unlimited research',
        'Unlimited publications',
        'All advanced features',
        'Highest quality',
        'Full API access',
        'Custom integrations',
        'Dedicated support'
      ]
    }
  ];

  return html`
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50">
      <h3 className="text-xl font-black text-slate-800 mb-6">Plan Comparison</h3>
      
      <div className="space-y-4">
        ${plans.map(plan => html`
          <div 
            key=${plan.name}
            className=${`p-6 rounded-2xl border-2 transition-all ${
              plan.name === currentPlan
                ? 'border-blue-600 bg-blue-50/50'
                : plan.popular
                ? 'border-purple-300 bg-purple-50/30'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            ${plan.popular && html`
              <div className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-2">
                Most Popular
              </div>
            `}
            
            <div className="flex items-baseline justify-between mb-4">
              <h4 className="text-lg font-black text-slate-800">${plan.name}</h4>
              <div>
                <span className="text-2xl font-black text-slate-800">${plan.price}</span>
                ${plan.pricePeriod && html`
                  <span className="text-sm text-slate-500">${plan.pricePeriod}</span>
                `}
              </div>
            </div>
            
            <ul className="space-y-2 mb-4">
              ${plan.features.map((feature, idx) => html`
                <li key=${idx} className="flex items-start space-x-2">
                  <i className="fa-solid fa-check text-emerald-500 mt-0.5"></i>
                  <span className="text-xs text-slate-600">${feature}</span>
                </li>
              `)}
            </ul>
            
            ${plan.name !== currentPlan && html`
              <button
                onClick=${() => onUpgrade(plan.name)}
                className=${`w-full py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  plan.popular
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ${plan.name === 'FREE' ? 'Current Plan' : 'Upgrade'}
              </button>
            `}
            
            ${plan.name === currentPlan && html`
              <div className="w-full py-2 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest text-center">
                Current Plan
              </div>
            `}
          </div>
        `)}
      </div>
    </div>
  `;
};

export default PlanComparison;
