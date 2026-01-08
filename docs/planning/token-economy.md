---
description: Defines how the internal credit/token system functions across Nova‑XFinity, including pricing logic, usage metering, and Web3-based extensions.
lastUpdated: 2026-01-07
status: Draft
---

# Token Economy & Credit System

## Overview

Nova‑XFinity uses a **token-based economy** as the unified currency for all AI-powered services. Tokens serve as the base unit of consumption across text generation, image creation, video production, research queries, and other premium features. This system provides:

- **Unified Billing:** Single currency for all services simplifies pricing and billing
- **Flexible Consumption:** Users can spend tokens across any service based on their needs
- **Fair Pricing:** Token costs reflect the computational resources and API costs of each operation
- **Usage Transparency:** Clear visibility into token consumption per operation
- **Future-Proof Design:** Token system enables Web3 integrations, trading, and governance

### Current Implementation

The current system tracks usage per feature type (articles, images, videos, research queries, WordPress publications). The token economy builds upon this foundation, introducing a unified credit system that maps to these operations while enabling more flexible pricing and consumption patterns.

**Migration Path:**
- Phase 1 (Current): Operation-based quotas (articles, images, videos, etc.)
- Phase 2 (Planned): Hybrid model with token conversion layer
- Phase 3 (Future): Full token economy with Web3 integration

---

## Token Definition & Unit Conversion

### Token as Base Unit

**1 Token** = The standard unit of consumption across all Nova‑XFinity services. Tokens represent a normalized value accounting for:
- Computational cost (API calls to AI providers)
- Processing time and complexity
- Quality tier (standard, high, highest)
- Service type (text, image, video, research)

### Operation-to-Token Mapping

The following table defines token costs for standard operations:

| Operation | Base Cost | Quality Multiplier | Example Calculations |
|-----------|-----------|-------------------|---------------------|
| **Text Generation** | | | |
| SEO Article (500-1000 words) | 10 tokens | Standard: 1x, High: 1.5x, Highest: 2x | FREE: 10, PRO: 15, ENTERPRISE: 20 |
| Article Section (200-500 words) | 5 tokens | Standard: 1x, High: 1.5x, Highest: 2x | FREE: 5, PRO: 7.5, ENTERPRISE: 10 |
| Metadata Generation | 2 tokens | 1x (all tiers) | All plans: 2 |
| CTA Block | 1 token | 1x (all tiers) | All plans: 1 |
| Outline Generation | 3 tokens | Standard: 1x, High: 1.5x, Highest: 2x | FREE: 3, PRO: 4.5, ENTERPRISE: 6 |
| **Image Generation** | | | |
| Single Image (Standard) | 8 tokens | Standard: 1x | FREE: 8 |
| Single Image (High Quality) | 12 tokens | High: 1x | PRO: 12 |
| Single Image (Highest Quality) | 20 tokens | Highest: 1x | ENTERPRISE: 20 |
| Image Edit/Enhancement | 6 tokens | Standard: 1x, High: 1.5x, Highest: 2x | FREE: 6, PRO: 9, ENTERPRISE: 12 |
| **Video Generation** | | | |
| Video Clip (10-30s) | 50 tokens | Standard: 1x, High: 1.5x, Highest: 2x | PRO: 75, ENTERPRISE: 100 |
| Video Clip (30-60s) | 100 tokens | Standard: 1x, High: 1.5x, Highest: 2x | PRO: 150, ENTERPRISE: 200 |
| Video Remix/Edit | 30 tokens | Standard: 1x, High: 1.5x, Highest: 2x | PRO: 45, ENTERPRISE: 60 |
| **Research & Analysis** | | | |
| Research Query | 5 tokens | 1x (all tiers) | All plans: 5 |
| SEO Analysis | 8 tokens | Standard: 1x, High: 1.5x, Highest: 2x | FREE: 8, PRO: 12, ENTERPRISE: 16 |
| Plagiarism Check | 3 tokens | 1x (all tiers) | All plans: 3 |
| **WordPress Integration** | | | |
| WordPress Publication | 2 tokens | 1x (all tiers) | All plans: 2 |
| **Chat Agent** | | | |
| Chat Message (Simple) | 2 tokens | 1x (all tiers) | All plans: 2 |
| Chat Message (Complex) | 5 tokens | 1x (all tiers) | All plans: 5 |
| Tool Use (Web Search, etc.) | 3 tokens | 1x (all tiers) | All plans: 3 |

### Quality Tier Impact

Quality tiers affect token costs through multipliers:
- **Standard (FREE):** 1.0x base cost
- **High (PRO):** 1.5x base cost (better AI models, more processing)
- **Highest (ENTERPRISE):** 2.0x base cost (premium models, advanced processing)

### Dynamic Pricing Factors

Token costs may vary based on:
- **Model Selection:** Different AI providers have varying costs
- **Complexity:** Longer articles, higher resolution images, longer videos cost more
- **Peak Usage:** Dynamic pricing during high-demand periods (planned)
- **Provider Costs:** API costs from Gemini, OpenAI, Anthropic, etc. reflected in token pricing

---

## Service Consumption Mapping

### Text Generation Services

**SEO Article Generation:**
```javascript
// Example token calculation
const articleTokens = calculateArticleTokens({
  wordCount: 750,
  quality: 'high', // PRO tier
  sections: 5,
  metadata: true,
  cta: true
});

// Calculation:
// Base: 10 tokens (500-1000 words)
// Quality multiplier: 1.5x (high)
// Sections: 5 × (7.5 tokens each) = 37.5 tokens
// Metadata: 2 tokens
// CTA: 1 token
// Total: ~40-45 tokens
```

**Token Cost Breakdown:**
- Outline generation: 3-6 tokens (quality-dependent)
- Section generation: 5-10 tokens per section (quality-dependent)
- Metadata: 2 tokens (fixed)
- CTA blocks: 1 token per block (fixed)
- SEO optimization: +2 tokens (if enabled)

### Image Generation Services

**Standard Image:**
- Resolution: 1024×1024
- Base cost: 8 tokens (FREE tier)
- Processing time: ~5-10 seconds

**High-Quality Image:**
- Resolution: 1536×1536 or higher
- Base cost: 12 tokens (PRO tier)
- Enhanced AI models, better detail
- Processing time: ~10-15 seconds

**Highest Quality Image:**
- Resolution: 2048×2048 or higher
- Base cost: 20 tokens (ENTERPRISE tier)
- Premium models, advanced post-processing
- Processing time: ~15-30 seconds

**Image Editing:**
- Enhancements: 6-12 tokens (quality-dependent)
- Style transfer: 8-16 tokens
- Background removal: 4-8 tokens

### Video/Audio Services

**Video Generation:**
- Short clip (10-30s): 50-100 tokens
- Medium clip (30-60s): 100-200 tokens
- Long clip (60s+): 200+ tokens
- Quality multipliers apply (1.5x for PRO, 2x for ENTERPRISE)

**Video Processing:**
- Remix: 30-60 tokens
- Branding/watermark: 10 tokens
- Subtitle generation: 15 tokens
- Format conversion: 5 tokens

**Audio Generation:**
- TTS (text-to-speech): 5 tokens per 1000 characters
- Voice cloning: 20 tokens setup + 3 tokens per use
- Audio enhancement: 8 tokens

### Chat Agent Services

**Simple Queries:**
- Basic question: 2 tokens
- Context-aware response: 3 tokens
- With memory lookup: +1 token

**Complex Queries:**
- Multi-step reasoning: 5 tokens
- Tool use (web search): +3 tokens
- Code generation: 5-10 tokens (complexity-dependent)
- Research synthesis: 8 tokens

**Agent Extensions:**
- Plugin execution: 3-5 tokens per plugin
- External API calls: 2-5 tokens (provider cost passed through)

### Research Lab Services

**Research Query:**
- Basic search: 5 tokens
- Deep research (multiple sources): 10 tokens
- Academic sources: 8 tokens
- Real-time data: 6 tokens

**SEO Analysis:**
- Standard: 8 tokens
- Advanced (PRO/ENTERPRISE): 12-16 tokens
- Competitive analysis: 15 tokens

**Content Analysis:**
- Plagiarism check: 3 tokens per 1000 words
- Readability score: 2 tokens
- Keyword density: 2 tokens

---

## Plan Tiers & Quotas

### Token Allocation by Plan

Each subscription tier includes a base token allocation that resets monthly:

| Plan | Monthly Tokens | Price/Month | Token/Price Ratio | Rollover | Overage |
|------|----------------|-------------|-------------------|----------|---------|
| **FREE** | 200 tokens | $0 | N/A | No | Blocked |
| **PRO** | 3,000 tokens | $29 | ~103 tokens/$ | Yes (10%) | Purchase packs |
| **ENTERPRISE** | 15,000 tokens | $99 | ~151 tokens/$ | Yes (20%) | Purchase packs |

### FREE Plan

**Monthly Allocation:** 200 tokens

**Breakdown by Service:**
- Articles: ~20 articles (10 tokens each at standard quality)
- Images: ~25 images (8 tokens each)
- Research: ~40 queries (5 tokens each)
- Videos: 0 (not available)
- WordPress: 0 (not available)

**Limitations:**
- No rollover (unused tokens expire)
- Hard limit (usage blocked at 200 tokens)
- Standard quality only
- No API access
- Community support only

### PRO Plan

**Monthly Allocation:** 3,000 tokens

**Breakdown by Service:**
- Articles: ~200 articles (15 tokens each at high quality)
- Images: ~250 images (12 tokens each)
- Videos: ~20 videos (75-150 tokens each)
- Research: Unlimited (but consumes tokens)
- WordPress: ~1,500 publications (2 tokens each)

**Benefits:**
- 10% rollover (up to 300 tokens carried to next month)
- Overage allowed (token packs available)
- High quality across all services
- API access included
- Priority support
- Advanced SEO features

### ENTERPRISE Plan

**Monthly Allocation:** 15,000 tokens

**Breakdown by Service:**
- Articles: ~750 articles (20 tokens each at highest quality)
- Images: ~750 images (20 tokens each)
- Videos: ~75-150 videos (100-200 tokens each)
- Research: Unlimited
- WordPress: Unlimited publications

**Benefits:**
- 20% rollover (up to 3,000 tokens carried to next month)
- Overage allowed with discounted token packs
- Highest quality across all services
- Full API access
- Custom integrations
- Dedicated support
- Custom token allocations available

### Bonus Credits & Incentives

**Onboarding:**
- New user signup: +50 tokens (one-time)
- Email verification: +25 tokens (one-time)

**Referrals:**
- Referrer reward: 200 tokens per successful referral
- Referee bonus: 100 tokens on signup

**Promotions:**
- Holiday bonuses: Variable token amounts
- Plan upgrades: Pro-rated token bonus
- Annual billing: +10% monthly token bonus

### Conversion from Legacy Quota System

Current quota-based limits map to tokens as follows:

```javascript
// Legacy quota → Token allocation mapping
const QUOTA_TO_TOKEN_MAP = {
  FREE: {
    articles: 10,      // 10 articles × 10 tokens = 100 tokens
    images: 25,        // 25 images × 8 tokens = 200 tokens
    research: 20,      // 20 queries × 5 tokens = 100 tokens
    // Total: ~400 tokens allocated, but capped at 200 for new system
  },
  PRO: {
    articles: 100,     // 100 articles × 15 tokens = 1,500 tokens
    images: 500,       // 500 images × 12 tokens = 6,000 tokens
    videos: 20,        // 20 videos × 75 tokens = 1,500 tokens
    research: -1,      // Unlimited (token-based)
    wordpress: 50,     // 50 publications × 2 tokens = 100 tokens
    // Total: ~9,100 tokens potential, allocated 3,000 base
  },
  ENTERPRISE: {
    articles: -1,      // Unlimited
    images: -1,        // Unlimited
    videos: 100,       // 100 videos × 100 tokens = 10,000 tokens
    research: -1,      // Unlimited
    wordpress: -1,     // Unlimited
    // Total: ~10,000+ tokens potential, allocated 15,000 base
  }
};
```

**Migration Strategy:**
1. **Phase 1:** Keep quota-based limits, add token tracking in parallel
2. **Phase 2:** Convert quotas to token costs, maintain backward compatibility
3. **Phase 3:** Full token economy, quotas become token-based calculations

---

## Purchases, Top-Ups & Currency Conversion

### Token Purchase Pricing

Users can purchase additional token packs when their monthly allocation is exhausted:

| Pack Size | Price | Price per Token | Bonus Tokens | Effective Rate |
|-----------|-------|-----------------|--------------|----------------|
| Small | $5 | $0.050/token | 0 | $0.050/token |
| Medium | $20 | $0.040/token | 50 | $0.038/token |
| Large | $50 | $0.035/token | 200 | $0.030/token |
| Extra Large | $100 | $0.030/token | 500 | $0.025/token |

**ENTERPRISE Discount:**
- 15% discount on all token packs
- Custom pricing for bulk purchases (contact sales)

### Currency Exchange Rates

Token pricing is denominated in USD. For international users:

```javascript
// Currency conversion (example rates, update via payment provider)
const CURRENCY_RATES = {
  USD: 1.0,      // Base currency
  EUR: 0.92,     // Example rate
  GBP: 0.79,     // Example rate
  JPY: 149.50,   // Example rate
  // Rates updated daily via Stripe/PayPal APIs
};

// Token pack pricing in local currency
const getLocalPrice = (usdPrice, currency) => {
  return usdPrice * (CURRENCY_RATES[currency] || 1.0);
};
```

### Payment Gateways

**Stripe Integration:**
- Credit/debit cards
- Apple Pay, Google Pay
- Local payment methods (region-dependent)
- Automatic currency conversion
- Real-time token credit upon payment success

**PayPal Integration:**
- PayPal account balance
- Credit cards via PayPal
- PayPal Credit
- Automatic token credit upon payment success

**Top-Up Flow:**
1. User selects token pack size
2. Chooses payment provider (Stripe/PayPal)
3. Checkout session created
4. Payment processed
5. Webhook confirms payment
6. Tokens credited to user account immediately
7. Email confirmation sent

### Subscription Token Allocation

Monthly subscriptions include token allocations that are credited at the start of each billing cycle:

```javascript
// Token allocation on subscription activation/renewal
const allocateMonthlyTokens = async (userId, plan) => {
  const tokenAllocation = PLAN_TOKENS[plan]; // 200, 3000, or 15000
  const rolloverTokens = calculateRollover(userId, plan);
  
  await creditTokens(userId, {
    amount: tokenAllocation + rolloverTokens,
    source: 'subscription',
    period: getCurrentBillingPeriod(),
    expiresAt: getNextBillingPeriodEnd()
  });
};
```

### Refund & Token Policy

**Refunds:**
- Subscription refunds: Pro-rated token allocation revoked
- Token pack refunds: Unused tokens refunded (within 30 days)
- Service issues: Token compensation credited to account

**Token Expiration:**
- Subscription tokens: Expire at billing period end (unless rolled over)
- Purchased tokens: No expiration (one-time purchases)
- Bonus tokens: Expire after 90 days (unless specified otherwise)

---

## Usage Tracking & History

### Token Balance Tracking

**Database Schema:**
```prisma
model TokenBalance {
  id              String   @id @default(uuid())
  userId          String
  balance         Int      @default(0)  // Current token balance
  lifetimeEarned  Int      @default(0)  // Total tokens ever earned
  lifetimeSpent   Int      @default(0)  // Total tokens ever spent
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  transactions    TokenTransaction[]
  user            User     @relation(fields: [userId], references: [id])
}

model TokenTransaction {
  id              String        @id @default(uuid())
  tokenBalanceId  String
  amount          Int           // Positive for credits, negative for debits
  type            TransactionType
  source          String        // 'subscription', 'purchase', 'usage', 'bonus', 'refund'
  description     String        // Human-readable description
  metadata        Json?         // Additional context (operation type, service, etc.)
  createdAt       DateTime      @default(now())
  
  balance         TokenBalance  @relation(fields: [tokenBalanceId], references: [id])
}

enum TransactionType {
  CREDIT  // Tokens added
  DEBIT   // Tokens spent
}
```

### Real-Time Usage Tracking

**Backend Implementation:**
```javascript
// Usage tracking service
export const recordTokenUsage = async (userId, operation, tokens) => {
  // Debit tokens
  await prisma.tokenTransaction.create({
    data: {
      tokenBalanceId: user.tokenBalance.id,
      amount: -tokens, // Negative for debits
      type: 'DEBIT',
      source: 'usage',
      description: `${operation.type} - ${operation.service}`,
      metadata: {
        service: operation.service,
        operation: operation.type,
        quality: operation.quality,
        resourceId: operation.resourceId
      }
    }
  });
  
  // Update balance
  await prisma.tokenBalance.update({
    where: { userId },
    data: {
      balance: { decrement: tokens },
      lifetimeSpent: { increment: tokens }
    }
  });
};
```

### Usage History API

**Endpoint:** `GET /api/tokens/history`

**Response:**
```json
{
  "balance": {
    "current": 1250,
    "monthlyAllocated": 3000,
    "monthlySpent": 1750,
    "purchased": 0,
    "rollover": 0,
    "bonus": 0
  },
  "transactions": [
    {
      "id": "txn_123",
      "type": "DEBIT",
      "amount": -15,
      "description": "Article Generation - SEO Article",
      "service": "articles",
      "createdAt": "2026-01-07T10:30:00Z",
      "metadata": {
        "articleId": "article_456",
        "wordCount": 750,
        "quality": "high"
      }
    },
    {
      "id": "txn_122",
      "type": "CREDIT",
      "amount": 3000,
      "description": "Monthly Subscription Allocation",
      "source": "subscription",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "usageByService": {
    "articles": { "spent": 1200, "count": 80 },
    "images": { "spent": 360, "count": 30 },
    "videos": { "spent": 150, "count": 2 },
    "research": { "spent": 40, "count": 8 }
  }
}
```

### Frontend Usage Display

**Components:**
- `UsageProgress.js` - Visual token balance and usage percentage
- `UsageStats.js` - Detailed breakdown by service
- `TokenHistory.js` - Transaction history table
- `TokenBalance.js` - Current balance with refresh

**Real-Time Updates:**
- WebSocket connection for live balance updates
- Polling fallback (every 30 seconds)
- Optimistic UI updates on token operations

---

## Token Expiry & Rollover

### Expiration Policies

**Subscription Tokens:**
- Allocated at billing period start
- Expire at billing period end (midnight UTC)
- Exception: Rollover tokens (see below)

**Purchased Tokens:**
- No expiration (one-time purchases)
- Stored separately from subscription tokens
- Used after subscription tokens are exhausted

**Bonus Tokens:**
- Expire after 90 days from credit date
- Used before purchased tokens
- Clear expiration notifications sent at 30, 7, and 1 day before expiry

### Rollover Logic

**PRO Plan:**
- 10% of unused monthly tokens rollover
- Maximum rollover: 300 tokens
- Example: 1,000 unused tokens → 100 tokens rolled over

**ENTERPRISE Plan:**
- 20% of unused monthly tokens rollover
- Maximum rollover: 3,000 tokens
- Example: 5,000 unused tokens → 1,000 tokens rolled over

**FREE Plan:**
- No rollover (all tokens expire at period end)

**Rollover Calculation:**
```javascript
const calculateRollover = (userId, plan, unusedTokens) => {
  const rolloverRate = {
    FREE: 0,
    PRO: 0.10,
    ENTERPRISE: 0.20
  };
  
  const maxRollover = {
    FREE: 0,
    PRO: 300,
    ENTERPRISE: 3000
  };
  
  const rate = rolloverRate[plan] || 0;
  const max = maxRollover[plan] || 0;
  
  const calculatedRollover = Math.floor(unusedTokens * rate);
  return Math.min(calculatedRollover, max);
};
```

**Rollover Timing:**
- Calculated at billing period end
- Credited at next billing period start
- Visible in transaction history with source "rollover"

### Incentives for Efficient Usage

**Usage Efficiency Rewards:**
- Users who use <50% of monthly allocation: +5% bonus next month (PRO/ENTERPRISE)
- Consistent efficient usage: Unlock premium features or discounts
- Usage analytics dashboard to identify optimization opportunities

**Expiration Warnings:**
- 7 days before expiry: Email notification
- 3 days before expiry: In-app banner
- 1 day before expiry: Push notification (if enabled)
- Expiration day: Final email with rollover summary

---

## Overage & Rate Limiting

### Overage Handling

**FREE Plan:**
- Hard limit: Usage blocked when tokens exhausted
- Upgrade prompt displayed
- No overage allowed

**PRO Plan:**
- Soft limit: Usage continues, but warning displayed
- Automatic token pack purchase prompt at 90% usage
- Optional: Auto-purchase enabled (user setting)

**ENTERPRISE Plan:**
- Soft limit with higher thresholds
- Custom overage agreements available
- Discounted token packs for overage
- Usage alerts at 80%, 90%, 95%

### Rate Limiting

**Per-User Rate Limits:**
```javascript
const RATE_LIMITS = {
  FREE: {
    requestsPerMinute: 10,
    requestsPerHour: 100,
    requestsPerDay: 500
  },
  PRO: {
    requestsPerMinute: 30,
    requestsPerHour: 500,
    requestsPerDay: 5000
  },
  ENTERPRISE: {
    requestsPerMinute: 100,
    requestsPerHour: 2000,
    requestsPerDay: 50000
  }
};
```

**Token-Based Rate Limiting:**
- Maximum token spend per minute: 100 tokens (FREE), 500 tokens (PRO), 2000 tokens (ENTERPRISE)
- Burst allowance: 2x normal rate for 1 minute (once per hour)
- Rate limit headers included in API responses

### Notifications & Alerts

**Usage Warnings:**
- 80% usage: Email + in-app notification
- 90% usage: Banner + upgrade prompt
- 95% usage: Modal + token pack purchase CTA
- 100% usage: Blocked + upgrade/purchase required

**Overage Alerts:**
- Real-time notification when entering overage
- Daily summary of overage usage
- Cost projection for current billing period

### Payment Prompts

**Auto-Purchase:**
- User-enabled setting for automatic token pack purchases
- Configurable pack size and threshold
- Email confirmation for each auto-purchase

**Manual Purchase Flow:**
1. Usage blocked or warning displayed
2. User clicks "Purchase Tokens"
3. Select pack size
4. Choose payment method
5. Complete checkout
6. Tokens credited immediately
7. Usage resumes automatically

---

## Optional: Web3 Token Extensions

### Vision for Web3 Integration

Nova‑XFinity's token economy is designed with Web3 compatibility in mind, enabling future expansion into blockchain-based token systems, decentralized governance, and cross-platform utility.

### On-Chain Token Minting

**Token Standard:**
- ERC-20 compatible token (Nova‑XFinity Credits - NOVA)
- Deployed on Ethereum L2 (Arbitrum, Polygon, or Base)
- Bridgeable to other chains via cross-chain bridges

**Minting Mechanism:**
```solidity
// Simplified token contract
contract NovaToken is ERC20 {
    mapping(address => uint256) public offChainBalance;
    
    // Mint tokens based on off-chain credit purchases
    function mintFromPurchase(uint256 amount, bytes calldata signature) external {
        require(verifySignature(msg.sender, amount, signature), "Invalid signature");
        _mint(msg.sender, amount);
    }
    
    // Bridge off-chain credits to on-chain tokens
    function bridgeToChain(uint256 credits) external {
        require(offChainBalance[msg.sender] >= credits, "Insufficient credits");
        offChainBalance[msg.sender] -= credits;
        _mint(msg.sender, credits);
    }
}
```

**Minting Triggers:**
- Subscription payments: Automatic minting of equivalent tokens
- Token pack purchases: 1:1 credit-to-token conversion
- Referral rewards: Bonus tokens minted on-chain
- Governance rewards: Staking rewards minted

### Wallet Integrations

**Supported Wallets:**
- MetaMask
- WalletConnect
- Coinbase Wallet
- Ledger (hardware wallet)
- Magic Link (email-based Web3 wallet)

**Integration Features:**
- Connect wallet to Nova‑XFinity account
- Sync off-chain credits with on-chain tokens
- Automatic bridging (optional)
- Cross-platform token portability

**User Flow:**
1. User connects wallet in settings
2. Verify wallet ownership (signature challenge)
3. Link wallet address to user account
4. Enable auto-sync (optional)
5. Tokens minted/bridged on subscription/purchase

### Governance Staking

**Staking Mechanism:**
- Stake NOVA tokens to participate in governance
- Minimum stake: 1,000 NOVA tokens
- Lock period: 30-365 days (longer lock = higher voting power)

**Governance Rights:**
- Vote on token pricing changes
- Vote on feature priorities
- Vote on treasury allocations
- Propose new features or improvements

**Staking Rewards:**
- Interest rate: 5-15% APY (based on lock period)
- Rewards paid in NOVA tokens
- Compounding available

**Implementation:**
```solidity
contract NovaStaking is ReentrancyGuard {
    struct Stake {
        uint256 amount;
        uint256 lockPeriod;
        uint256 startTime;
        uint256 rewards;
    }
    
    mapping(address => Stake) public stakes;
    
    function stake(uint256 amount, uint256 lockDays) external {
        // Stake tokens, calculate rewards based on lock period
    }
    
    function vote(uint256 proposalId, bool support) external {
        require(stakes[msg.sender].amount > 0, "Must stake to vote");
        // Record vote with weighted voting power
    }
}
```

### Utility-Based Token Pricing

**Dynamic Pricing Model:**
- Token price adjusts based on platform usage and demand
- Market-based pricing via AMM (Automated Market Maker)
- Price discovery through token trading

**Pricing Factors:**
- AI provider costs (Gemini, OpenAI, Anthropic API costs)
- Platform usage volume
- Token supply/demand ratio
- Market conditions (if publicly traded)

**Peg Mechanism:**
- Soft peg to USD: $0.01-0.05 per token
- Stability pool maintains peg during volatility
- Arbitrage opportunities for traders

### Token Trading & Liquidity

**Decentralized Exchange (DEX) Integration:**
- List NOVA token on Uniswap, SushiSwap, or similar
- Provide liquidity pools (NOVA/USDC, NOVA/ETH)
- Enable users to trade tokens directly

**Centralized Exchange (CEX) Listings:**
- Future listings on major exchanges (if applicable)
- Increased liquidity and accessibility
- Fiat on-ramps for easier token purchases

### Cross-Platform Utility

**Partner Integrations:**
- Use NOVA tokens across partner platforms
- Unified credit system across ecosystem
- Token grants for ecosystem development

**Third-Party Redemptions:**
- Exchange NOVA tokens for services on partner platforms
- Gift tokens to other users
- Donate tokens to open-source projects

### Implementation Roadmap

**Phase 1: Foundation**
- [ ] Design token smart contract
- [ ] Deploy testnet version
- [ ] Wallet connection integration
- [ ] Basic bridging mechanism

**Phase 2: Governance**
- [ ] Staking contract deployment
- [ ] Governance voting system
- [ ] Reward distribution mechanism
- [ ] UI for staking and voting

**Phase 3: Trading**
- [ ] DEX liquidity provision
- [ ] Trading interface integration
- [ ] Market-making strategies
- [ ] Price discovery mechanisms

**Phase 4: Ecosystem (2027)**
- [ ] Partner platform integrations
- [ ] Cross-platform token utility
- [ ] CEX listings (if applicable)
- [ ] Advanced DeFi features

---

## Related Documentation

- [Subscriptions and Billing](../architecture/subscriptions-and-billing.md) - Subscription tiers, billing flows, payment providers
- [AI Agent Extension](./ai-agent-extension.md) - AI service architecture and provider routing
- [Backend Architecture](../architecture/backend-architecture.md) - Backend system structure and services
- [Webhooks](../architecture/webhooks.md) - Webhook event processing and payment confirmations
- [Security Model](../architecture/security-model.md) - Security considerations and PCI compliance

---

## Implementation Notes

### Current State

The token economy system is currently in **design phase**. The existing quota-based system will be migrated to token-based tracking gradually:

1. **Parallel Tracking:** Add token calculation alongside quota tracking
2. **Gradual Migration:** Convert operations to token costs incrementally
3. **Full Implementation:** Complete token economy with all features

### Technical Considerations

**Database Migration:**
- Add `TokenBalance` and `TokenTransaction` tables
- Migrate existing usage data to token equivalents
- Maintain backward compatibility during transition

**API Changes:**
- New endpoints: `/api/tokens/balance`, `/api/tokens/history`, `/api/tokens/purchase`
- Update existing endpoints to track token usage
- Maintain quota endpoints for backward compatibility

**Frontend Updates:**
- Token balance display in user dashboard
- Usage history components
- Token purchase flows
- Real-time balance updates

### Testing Strategy

- Unit tests for token calculations
- Integration tests for purchase flows
- E2E tests for usage tracking
- Load tests for high-volume token operations
- Web3 integration tests (testnet)

---

## Changelog

**2026-01-07:**
- Initial token economy documentation created
- Defined token as base unit with operation mappings
- Documented plan tiers and token allocations
- Outlined Web3 extension vision
- Added implementation roadmap

---

**Status:** Draft  
**Next Review:** 2026-02-07  
**Owner:** Product & Engineering Teams
