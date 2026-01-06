import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const UpgradeModal = ({ currentPlan, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      // TODO: Create Stripe checkout session
      // const response = await fetch('/api/subscription/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ plan: selectedPlan })
      // });
      // const data = await response.json();
      // window.location.href = data.data.url;
      
      // Mock for now
      alert(`Redirecting to checkout for ${selectedPlan} plan...`);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availablePlans = currentPlan === 'FREE' 
    ? ['PRO', 'ENTERPRISE']
    : ['ENTERPRISE'];

  return html`
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-slate-800">Upgrade Your Plan</h3>
          <button
            onClick=${onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="space-y-4 mb-8">
          ${availablePlans.map(plan => {
            const isSelected = selectedPlan === plan;
            const isPro = plan === 'PRO';
            
            return html`
              <div
                key=${plan}
                onClick=${() => setSelectedPlan(plan)}
                className=${`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                } ${isPro ? 'relative' : ''}`}
              >
                ${isPro && html`
                  <div className="absolute top-4 right-4 text-[9px] font-black text-purple-600 uppercase tracking-widest bg-purple-100 px-2 py-1 rounded">
                    Popular
                  </div>
                `}
                
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-black text-slate-800">${plan}</h4>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-black text-slate-800">
                      ${plan === 'PRO' ? '$29' : '$99'}
                    </span>
                    <span className="text-sm text-slate-500 ml-1">/month</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className=${`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}>
                    ${isSelected && html`
                      <i className="fa-solid fa-check text-white text-xs"></i>
                    `}
                  </div>
                  <span className="text-sm text-slate-600">Select this plan</span>
                </div>
              </div>
            `;
          })}
        </div>

        <div className="flex space-x-4">
          <button
            onClick=${onClose}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick=${handleUpgrade}
            disabled=${!selectedPlan || loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
          >
            ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : ''}
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  `;
};

export default UpgradeModal;
