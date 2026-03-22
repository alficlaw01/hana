# Product Brief — Hana 🌸

## Vision
The dating app where your agent finds your one in 8 billion. Not another swipe app — an entirely new paradigm where AI agents handle the compatibility discovery phase, so humans only show up when there's a real reason to.

## The Problem
Modern dating apps are broken in a specific way: they've optimised for engagement, not outcomes. The average Hinge user spends 35 minutes/day on the app. Most matches never lead to a date. The process is exhausting — weeks of small talk to discover basic incompatibility.

The bottleneck isn't meeting people. It's the information gathering phase. Figuring out if someone is right for you takes weeks of awkward texting. It shouldn't.

## The Insight
Your AI agent already knows everything about you — your interests, personality, values, communication style, what you're looking for. Two agents talking can compress weeks of discovery into minutes. By the time you see a match, compatibility is already established.

## How Hana Works
1. **Onboarding** — you build your agent profile. Not just photos — your personality, values, interests, dealbreakers, communication style, what you're actually looking for. The agent learns you.
2. **Agent matching** — your agent communicates with other agents in the background. No swiping. It's assessing compatibility on dimensions you actually care about.
3. **Match presentation** — when your agent finds a strong match, it presents you with a profile. Not a stranger — someone you're already pre-vetted to be compatible with.
4. **Date suggestion** — the app suggests a specific date idea based on mutual interests. Not "grab a coffee" — "there's a jazz night at Ronnie Scott's on Friday, you both love jazz."
5. **You show up** — that's it. The hard work is done.

## Core Differentiator
Every other dating app monetises the *searching*. Hana monetises the *finding*. We're not competing with Tinder for attention — we're competing with the concept of settling.

## Phase 1 MVP
### Core Features
- Agent profile builder (personality questionnaire + interests + dealbreakers + photos)
- Agent-to-agent compatibility matching (background process)
- Match notification + profile reveal
- Date suggestion engine (based on mutual interests + location)
- Basic messaging (post-match only — agents did the work, humans take over)
- Freemium: free tier (limited matches/month), premium (unlimited + better matching)

### What's NOT in v1
- Voice/video agents
- Real-time agent conversation visible to user
- Group dating
- Events integration
- Verification beyond email

### Tech Stack
- React Native (iOS + Android from one codebase)
- Supabase (database + auth + realtime)
- OpenAI / Claude API (agent matching logic)
- Stripe (subscriptions)
- Mapbox (location/venue suggestions)
- Vercel (backend APIs)

### Success Metrics (90 days)
- 1,000 signups in launch city (London)
- 30% week-1 retention
- 100 matches facilitated
- 10 confirmed dates
- NPS > 50

## The Viral Mechanic
"My agent found me a date" is a sentence nobody has said before. It's inherently shareable. The experience is novel enough that people talk about it.

- TikTok content writes itself: "I let my AI agent find my boyfriend for 30 days"
- Press angle: "The dating app where you never swipe again"
- Referral mechanic: invite your single friends, your agent gets smarter (more matches in your network)

## Phase 2
- Agent transparency — see a summary of what your agent found out about your match
- Voice onboarding — talk to your agent to build your profile
- Venue partnerships — Hana-recommended date spots, restaurants, experiences
- Agent coaching — your agent tells you what's working/not working in your dating profile

## Phase 3
- "Hana Concierge" — white glove premium tier, human + AI matchmaker
- Corporate partnerships (singles events, experiences)
- International expansion

## Revenue Model
| Tier | Price | Features |
|------|-------|---------|
| Free | £0 | 3 agent matches/month, basic profile |
| Hana+ | £14.99/month | Unlimited matches, date suggestions, priority matching |
| Hana Concierge | £49.99/month | Human matchmaker + AI, guaranteed dates |

Comparable ARPU to Hinge (~£12/month avg across user base) with higher conversion expected due to outcome-focused positioning.

## Go-To-Market
### Launch strategy
- London first — highest density of young professionals, dating app adopters
- Waitlist before launch — exclusivity drives demand
- 500 founding members who get permanent free premium

### Acquisition
- TikTok/Instagram — "AI found my date" content, influencer seeding
- PR — tech and lifestyle press, the story is inherently newsworthy
- University societies (London universities — LSE, UCL, Imperial, King's)
- Young professional networks (LinkedIn, industry Slacks)

### Key insight on targeting
The early adopter is: 25-35, London, professional, tired of Hinge/Bumble, open to tech, slightly romantic. This person is on TikTok and reads the Guardian. Target accordingly.

## Pain Points Being Solved
1. **Swipe fatigue** — nobody wants to spend 35 mins/day on a dating app
2. **Shallow matching** — photos and one-liners don't predict compatibility
3. **Conversation dead-ends** — weeks of texting that goes nowhere
4. **Date friction** — even when there's a match, planning a date is hard
5. **Settling** — people settle because finding the right person feels impossible

## Competitive Positioning
"Stop swiping. Start meeting. Your agent knows who you're looking for."

## Technical Architecture (v1)
```
Mobile: React Native (Expo)
Backend: Node.js / Express on Vercel
Database: Supabase (PostgreSQL + realtime)
Agent logic: Claude API (compatibility assessment)
Auth: Supabase Auth
Payments: Stripe
Location/venues: Google Places API
Push notifications: Expo Notifications
```

## The Agent Matching Engine (Pulse — future agent)
The core IP of Hana. Takes two agent profiles and produces a compatibility score + reasoning across dimensions:
- Values alignment
- Lifestyle compatibility  
- Communication style match
- Interest overlap
- Dealbreaker check
- Long-term vs short-term intent alignment

This is what makes Hana defensible. The matching engine improves with every interaction.

## Team
- Jason Bennett — CEO/Founder
- Alfi — CTO/Orchestrator
- Benito — Backend Engineer
- Bloom (TBD) — Frontend/Mobile Engineer
- Pulse (TBD) — Matching Engine Agent
- Cupid (TBD) — QA Reviewer
- Scout — Commercial Intelligence
