# ShieldRide: AI-Powered Parametric Income Protection for Quick-Commerce Delivery Workers

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [User Persona and Scenario](#2-user-persona-and-scenario)
3. [Solution Overview](#3-solution-overview)
4. [Key Innovations and USP](#4-key-innovations-and-usp)
5. [System Architecture](#5-system-architecture)
6. [AI/ML Integration](#6-aiml-integration)
7. [Pricing Model](#7-pricing-model)
8. [Pricing Architecture](#8-pricing-architecture)
9. [Parametric Triggers](#9-parametric-triggers)
10. [Fraud Detection](#10-fraud-detection)
11. [Tech Stack](#11-tech-stack)
12. [User Flow](#12-user-flow)
13. [Dashboard Features](#13-dashboard-features)
14. [Future Scope](#14-future-scope)

---

## 1. The Problem

### Income at the Mercy of the Sky

Rajan earns his living on a bicycle. Every morning at 6:30 AM, he opens the Blinkit app, pulls on his delivery bag, and rides out into Bengaluru. On a clear weekday, he completes 18 to 22 deliveries and earns somewhere between Rs. 650 and Rs. 800. That income feeds his family, pays his room rent, and keeps his phone topped up enough to stay online for the next day.

Then the monsoon arrives.

On a heavy rain day, Rajan might complete 4 or 5 deliveries before the roads flood. The platform demand spikes but warehouse dispatch slows. Customers cancel. Order values drop as restaurants close. Rajan sits under a flyover for three hours waiting for the rain to ease, watching his daily earnings collapse to Rs. 120. He has no sick leave. No paid time off. No insurance that covers this. The app does not know it is raining in his zone. It only knows he did not deliver.

This is not an isolated story. Across India, hundreds of thousands of gig delivery workers face the same structural vulnerability. Their income is directly tied to conditions they cannot control — rainfall, air quality index spikes, localized curfews, festival-related zone shutdowns, and platform-level demand fluctuations. Unlike salaried workers, they have no employer buffer. Unlike farmers, they have no government crop insurance scheme designed for them.

### The Core Problem

Quick-commerce delivery workers in India operate in a uniquely fragile economic position:

**Income Instability**: Earnings vary dramatically day to day, not just due to effort or skill but due to external disruptions entirely outside the worker's control. A single bad-weather week can wipe out 40 to 60 percent of monthly income.

**No Relevant Safety Net**: Existing insurance products focus on health, accident, or vehicle coverage. None address income loss from environmental or operational disruptions. Even platform-level programs are inconsistent and platform-specific — if a rider works across Zepto, Blinkit, and Swiggy Instamart, no single scheme covers the full picture.

**Lack of Data Visibility**: Workers have no reliable way to anticipate disruptions, quantify their earnings risk, or plan financially for bad weeks. They operate on intuition and informal peer networks.

**Excluded from Traditional Finance**: Most gig workers do not have formal income documentation, making them ineligible for mainstream financial products like income insurance or credit lines tied to earnings history.

ShieldRide exists to close this gap.

---

## 2. User Persona and Scenario

### Persona: Rajan, 29, Quick-Commerce Delivery Executive

**Location**: Koramangala, Bengaluru  
**Platforms**: Blinkit (primary), Zepto (secondary)  
**Work Pattern**: 10 to 12 hours per day, 6 days a week  
**Average Weekly Earnings**: Rs. 4,800 to Rs. 5,600  
**Dependents**: Wife and one child  
**Financial Cushion**: 3 to 5 days of reserve savings at any time

**Daily Workflow**:
- 6:30 AM: Log into Blinkit, begin accepting orders in Koramangala zone
- 8:00 AM: Peak delivery window, 5 to 7 deliveries per hour possible
- 12:30 PM: Midday lull, switch to Zepto to find orders
- 5:00 PM: Evening peak, highest per-delivery incentives
- 9:00 PM: Log off, count day's earnings, plan next day

**Pain Points**:
- Cannot predict earnings week to week
- Has no way to recover income lost to rain, AQI shutdowns, or zone-level restrictions
- Receiving money from multiple platforms means no single "income" view
- Cannot afford the premium on traditional insurance products designed for salaried individuals
- Has no formal record of income to prove losses to anyone

**Example Scenario**:

It is the third week of July. The AQI in Delhi crosses 350. The municipal authority issues an advisory restricting outdoor movement for non-essential services between 12 PM and 4 PM. Several dark stores in Rajan's operating zone suspend dispatch. His effective earning window shrinks from 10 hours to 6 hours. Across that week, he earns Rs. 2,900 — nearly 45 percent below his average.

With ShieldRide, Rajan had purchased a weekly protection plan 48 hours before the forecast data triggered elevated risk pricing. The system detected an AQI trajectory and zone-level disruption probability above the trigger threshold. By Thursday, when cumulative earnings-impact data confirmed the shortfall, an automated payout of Rs. 1,800 was transferred to his UPI account. No claim. No documentation. No phone call required.

---

## 3. Solution Overview

### What ShieldRide Does

ShieldRide is an AI-powered parametric income protection platform built specifically for quick-commerce delivery workers. It protects against earnings loss caused by external disruptions — weather events, air quality restrictions, demand collapses, and zone shutdowns — through automatic payouts triggered by verifiable external data, not claim forms.

The platform is:
- **Parametric**: Payouts are triggered automatically when pre-defined measurable conditions are met. No manual claim process exists. The system monitors conditions continuously and acts independently.
- **AI-Powered**: Risk scoring, earnings baseline estimation, disruption prediction, and fraud detection are all handled by machine learning models trained on delivery patterns, weather data, and peer activity signals.
- **Income-Focused**: The coverage is strictly limited to income loss from operational disruptions. Health, accident, and vehicle coverage are out of scope.
- **Platform-Agnostic**: Workers who earn across multiple delivery platforms — Zepto, Blinkit, Swiggy Instamart, BigBasket Now — receive unified coverage computed from their aggregated earning profile.
- **Weekly**: Plans are priced and renewed weekly, making them accessible and aligned with how gig workers experience and plan their income.

### High-Level System Flow

```
Worker Onboards
      |
      v
Earnings Baseline Established (multi-platform aggregation)
      |
      v
Risk Engine Scores Current Week (weather + zone + peer + demand signals)
      |
      v
Weekly Premium Quoted and Accepted
      |
      v
Continuous Monitoring (weather APIs, zone data, peer activity)
      |
      v
Trigger Threshold Evaluated Daily
      |
      v
Trigger Met? --> Payout Initiated (UPI / simulated transfer)
      |
      v
Earnings Impact Confirmed --> Feedback Loop Updates User Risk Profile
```

---

## 4. Key Innovations and USP

### 4.1 Platform-Agnostic Income Protection

**What it is**: Most gig workers in India today earn across two or three platforms simultaneously. Coverage tied to a single platform misses a large fraction of a worker's real income exposure. ShieldRide aggregates declared and inferred earnings across all platforms a worker operates on and computes coverage based on their total income profile — not just one app.

**How it works**: During onboarding, workers declare their active platforms and provide historical earnings screenshots or connect through available data export features. The system uses this to build a multi-platform earnings baseline. Over time, weekly activity data from each platform is incorporated to maintain a current and accurate picture of total income. The AI model maintains a unified weekly earnings estimate that drives all pricing and payout calculations.

**Why it is impactful**: A worker earning Rs. 2,800 per week from Blinkit and Rs. 2,000 from Zepto has a real income of Rs. 4,800. A platform-specific product would cover at most Rs. 2,800. ShieldRide covers the full Rs. 4,800 baseline, making the safety net meaningfully complete rather than symbolic.

---

### 4.2 Peer-Based Risk Intelligence

**What it is**: Individual data on any single worker is limited and noisy. But when a disruption occurs — heavy rain, a zone shutdown, a demand collapse — it affects dozens or hundreds of workers in the same area simultaneously. ShieldRide uses the collective activity patterns of nearby workers as a disruption signal that is faster, more localized, and more actionable than any single data source.

**How it works**: The platform tracks aggregated, anonymized delivery activity metrics across all enrolled workers by zone and time window. A sudden drop in collective order acceptance rates, average delivery speed, or active worker count in a given zone — even before external data sources confirm the disruption — signals an unfolding event. This peer signal feeds into the real-time trigger evaluation engine and can independently satisfy or accelerate a trigger condition when multiple workers in a zone show correlated income drops.

**Why it is impactful**: Weather APIs report conditions with a 15 to 30-minute lag and often at city-wide or district-wide resolution. Peer signals are hyperlocal and nearly instantaneous. A flooded alley that stops 20 workers in a 500-meter radius will show up in peer data within minutes, long before any official source registers it. This makes ShieldRide's trigger system faster, more granular, and harder to game than purely external-data-based systems.

---

### 4.3 Behavioral Incentive Engine

**What it is**: Workers who follow AI-generated recommendations — shifting zones before a weather event, starting shifts earlier to front-load deliveries ahead of a disruption, or avoiding high-risk operational patterns — demonstrate both better financial outcomes and lower platform risk. ShieldRide rewards this behavior with premium discounts and improved plan tiers.

**How it works**: The system generates weekly behavioral recommendations based on predicted disruption patterns. A worker who follows a recommendation (verified by GPS and activity data) earns a "compliance point." Compliance points accumulate into a Behavioral Score that applies a discount multiplier to the following week's premium. Workers with consistently high behavioral scores also gain access to enhanced payout tiers, priority support, and early-warning notifications.

**Why it is impactful**: This turns ShieldRide from a passive financial product into an active income-optimization tool. Workers are incentivized to behave in ways that reduce their own risk, which also reduces the platform's payout liability. The result is a self-reinforcing system where better-informed workers cost the platform less in payouts while paying lower premiums — a genuine alignment of incentives between the worker and the insurer.

---

## 5. System Architecture

### Component Overview

```
+-------------------+       +------------------------+
|   Worker Frontend |       |   Admin Dashboard      |
|   (Next.js / PWA) |       |   (React + Charts)     |
+--------+----------+       +----------+-------------+
         |                             |
         v                             v
+------------------------------------------+
|              API Gateway (Node.js)        |
|   Auth | Rate Limiting | Request Routing  |
+---+----------+----------+-----------+----+
    |          |          |           |
    v          v          v           v
+-------+ +--------+ +--------+ +----------+
| User  | | Policy | | Risk   | | Trigger  |
| Svc   | | Engine | | Engine | | Engine   |
+-------+ +--------+ +---+----+ +----+-----+
                          |           |
                          v           v
              +-----------+-----+  +--+-------------+
              |  AI/ML Service  |  |  Payout Service |
              |  (Python/Flask) |  |  (Razorpay Mock)|
              +---+---+---+-----+  +----------------+
                  |   |   |
          +-------+   |   +-------+
          v           v           v
    +----------+ +----------+ +----------+
    | Risk     | | Earnings | | Fraud    |
    | Predictor| | Estimator| | Detector |
    +----------+ +----------+ +----------+
          |           |           |
          v           v           v
+------------------------------------------+
|          External Data Layer              |
|  Weather API | Zone Data | Peer Signals  |
|  Delivery Activity (Mock) | GPS Logs     |
+------------------------------------------+
          |
          v
+------------------------------------------+
|               Database Layer              |
|  PostgreSQL (users, policies, payouts)   |
|  Redis (real-time peer signals, cache)   |
+------------------------------------------+
```

### Data Flow: Step by Step

**Step 1 — User Input**: The worker completes onboarding, providing platform declarations, earnings history, and zone information through the mobile-first frontend.

**Step 2 — Data Ingestion**: The API Gateway routes onboarding data to the User Service (profile storage) and the Risk Engine (initial risk scoring).

**Step 3 — AI Processing**: The AI/ML Service receives the worker's profile, zone, historical earnings, and current external data (weather forecast, zone status). It produces a risk score, earnings baseline, and expected disruption probability for the upcoming week.

**Step 4 — Decision and Pricing**: The Policy Engine uses AI outputs to compute the weekly premium and presents it to the worker for acceptance.

**Step 5 — Monitoring**: Once a policy is active, the Trigger Engine runs continuous checks against real-time weather data, zone status feeds, and peer activity signals. Checks run every 30 minutes during active delivery hours.

**Step 6 — Trigger Evaluation**: When a trigger threshold is met (e.g., rainfall intensity above 40 mm/hr sustained for 2 hours in the worker's zone), the Trigger Engine flags the event and passes it to the Payout Service.

**Step 7 — Payout**: The Payout Service validates the trigger against fraud detection checks and initiates a simulated UPI transfer. The worker is notified immediately.

**Step 8 — Feedback Loop**: Post-payout, the confirmed earnings impact data updates the worker's risk profile, the zone-level disruption history, and the AI model's training dataset.

---

## 6. AI/ML Integration

### 6.1 Risk Prediction Model

**Purpose**: Estimate the probability that a given worker in a given zone will experience income disruption in the upcoming week.

**Inputs**: Historical weekly earnings volatility, zone-level weather event frequency (past 90 days), current weather forecast data (7-day), air quality index trajectory, zone restriction history, day-of-week patterns, seasonal factors.

**Model**: Gradient Boosted Decision Tree (XGBoost) trained on synthetic delivery disruption data augmented with public weather event records. Outputs a Risk Score between 0.0 and 1.0.

**Why this model**: Tree-based models handle mixed feature types well (numerical weather data + categorical zone identifiers), are interpretable enough for regulatory purposes, and train efficiently on tabular data without requiring large volumes.

---

### 6.2 Earnings Impact Estimator

**Purpose**: Given that a disruption occurs, estimate how many hours of productive delivery time will be lost and what the corresponding earnings shortfall will be.

**Inputs**: Worker's historical hourly earnings rate by day and time slot, disruption type and intensity, zone-level historical impact data for similar events, peer activity drop percentage during the event.

**Model**: Linear regression with interaction terms (disruption intensity × zone historical sensitivity × time-of-day). Outputs: Expected Lost Hours and Expected Weekly Loss in rupees.

**Calibration**: Model is re-calibrated weekly using realized payout data versus predicted loss, maintaining a rolling accuracy check.

---

### 6.3 Fraud Detection Logic

**Purpose**: Prevent false trigger claims and coordinated gaming of the parametric system.

**Approach**: Rule-based filters combined with an anomaly detection model.

- GPS Consistency Check: Worker's GPS trajectory during the claimed disruption window is compared against declared zone. Significant deviation flags the payout for review.
- Activity Consistency Check: If a worker claims income loss from a disruption but GPS and app-activity logs show continued delivery activity at normal rates, the claim is flagged.
- Peer Comparison: If a worker's claimed disruption impact is more than 2.5 standard deviations from the peer group average for that zone and event, the payout is held for manual review.
- Temporal Anomaly Detection: Isolation Forest model identifies unusual patterns in policy purchase timing (e.g., purchasing immediately before a known forecasted event consistently, suggesting information asymmetry exploitation).

---

### 6.4 Peer-Based Intelligence Model

**Purpose**: Use collective worker behavior as a real-time disruption signal.

**Inputs**: Zone-level aggregate order acceptance rates (5-minute bins), average active worker count per zone (30-minute bins), average delivery speed per zone.

**Signal Processing**: A rolling z-score model identifies when zone-level metrics drop more than 1.8 standard deviations below the zone's historical baseline for that time window. This constitutes a peer-verified disruption signal. Three consecutive flagged windows escalate to trigger-ready status.

---

## 7. Pricing Model

### Core Formula

The weekly premium for a given worker is computed as:

**Weekly Premium = (Avg Hourly Earnings x Expected Lost Hours x Risk Score) + Platform Fee - Behavioral Discount**

This formula ensures the premium is directly proportional to what the worker stands to lose, adjusted for the likelihood of the event and the worker's individual risk profile.

---

### Variable Definitions

**Avg Hourly Earnings (E_h)**

The worker's average earnings per active delivery hour, computed over the trailing four weeks. Aggregated across all declared platforms.

E_h = Total Earnings (past 4 weeks) / Total Active Delivery Hours (past 4 weeks)

For a new worker, the platform uses zone-level median earnings as the starting baseline.

---

**Expected Lost Hours (L_h)**

The number of delivery hours expected to be lost in the upcoming week due to disruption, derived from the disruption probability and the historical average disruption duration for the worker's zone.

L_h = Disruption Probability x Avg Disruption Duration (hours) x Active Weekly Hours Fraction

Where:
- Disruption Probability = output of the Risk Prediction Model (0.0 to 1.0)
- Avg Disruption Duration = zone-level historical average hours lost per disruption event
- Active Weekly Hours Fraction = ratio of hours the worker typically operates during high-disruption time windows (e.g., monsoon afternoons)

---

**Risk Score (R)**

A composite score between 0.5 and 1.5 that scales the premium based on the worker's individual and zone-level risk profile. A score of 1.0 represents average risk.

R = Base Zone Risk x Weather Intensity Multiplier x Seasonal Adjustment

- Base Zone Risk: Historical disruption frequency for the worker's primary operating zone (scaled 0.8 to 1.2)
- Weather Intensity Multiplier: Derived from 7-day forecast severity (1.0 = normal, up to 1.3 for extreme forecasts)
- Seasonal Adjustment: Pre-loaded seasonal factors (monsoon season = 1.1, winter fog = 1.05, summer heat = 0.95)

---

**Platform Fee (F)**

A fixed operational fee added to every policy to cover platform operating costs. Set at Rs. 15 per weekly policy. This fee is not risk-adjusted and does not affect the coverage amount.

---

**Behavioral Discount (D)**

A reduction applied to the premium based on the worker's Behavioral Score from the prior week.

D = Premium_before_discount x Discount Rate

| Behavioral Score | Discount Rate |
|-----------------|--------------|
| 0 to 40         | 0%           |
| 41 to 60        | 5%           |
| 61 to 80        | 10%          |
| 81 to 100       | 15%          |

Behavioral Score is computed from recommendation compliance, GPS consistency, and platform engagement metrics.

---

### Supporting Formulas

**Expected Weekly Loss**

This represents the maximum payout the worker is eligible to receive in a triggered week.

Expected Weekly Loss = E_h x L_h

This is the coverage ceiling. Actual payouts are scaled to the verified earnings shortfall, up to this ceiling.

---

**Loss Ratio**

Used for platform-level actuarial monitoring.

Loss Ratio = Total Payouts Issued / Total Premium Collected

A healthy loss ratio for a parametric product is typically maintained between 0.55 and 0.75. Values above 0.80 trigger premium recalibration for the affected zones.

---

**Expected Utility (Decision Engine)**

Used by the AI to determine optimal policy recommendations for workers.

Expected Utility = Expected Weekly Earnings - (Risk Score x Expected Weekly Loss)

Workers with lower expected utility scores are prioritized for proactive outreach, higher coverage tiers, and behavioral recommendations. This metric is also used to generate the worker's weekly "Income Risk Forecast" displayed on the dashboard.

---

### Worked Example

Worker: Rajan, Koramangala zone, Bengaluru  
E_h = Rs. 75 per hour  
Disruption Probability (upcoming week, monsoon forecast): 0.60  
Avg Disruption Duration: 6 hours  
Active Weekly Hours Fraction: 0.40  

L_h = 0.60 x 6 x 0.40 = 1.44 hours  
Risk Score: 1.15 (monsoon season, high-intensity forecast)  
Platform Fee: Rs. 15  
Behavioral Score: 72 → Discount Rate: 10%  

Base Premium = Rs. 75 x 1.44 x 1.15 = Rs. 124.20  
After Platform Fee: Rs. 124.20 + Rs. 15 = Rs. 139.20  
After Behavioral Discount (10%): Rs. 139.20 - Rs. 12.42 = Rs. 126.78  

**Final Weekly Premium: Rs. 127 (rounded)**  
**Expected Weekly Loss Coverage: Rs. 75 x 1.44 = Rs. 108**

---

## 8. Pricing Architecture

### How Pricing Is Computed in the System

**Step 1 — Collect User Data**  
Worker profile, declared platforms, operating zones, historical earnings data, and GPS activity logs are ingested from the User Service. For returning users, the trailing four-week earnings window is loaded. For new users, zone-level medians are used.

**Step 2 — Calculate Earnings Baseline**  
The Earnings Estimator computes E_h from multi-platform earnings data. Outlier weeks (more than two standard deviations from the worker's historical mean) are excluded from the average to prevent single anomalous weeks from distorting the baseline.

**Step 3 — Predict Disruption Probability**  
The Risk Prediction Model ingests current weather API data, AQI forecasts, zone status flags, and historical disruption patterns for the upcoming 7-day window. It outputs a probability between 0.0 and 1.0.

**Step 4 — Estimate Expected Loss**  
L_h is calculated using the disruption probability, zone-level disruption duration history, and the worker's active hours profile. Expected Weekly Loss is computed.

**Step 5 — Apply Risk Multipliers**  
Base Zone Risk, Weather Intensity Multiplier, and Seasonal Adjustment are fetched and applied to produce the Risk Score R.

**Step 6 — Apply Behavioral Adjustments**  
The worker's Behavioral Score from the prior week is retrieved. The appropriate discount rate is looked up and applied.

**Step 7 — Output Weekly Premium**  
Platform Fee is added. The final premium is rounded to the nearest rupee and presented to the worker. The premium quote includes a plain-language breakdown: estimated coverage amount, trigger conditions, and expected payout scenarios.

### How Pricing Updates Weekly

Pricing is recomputed every Monday for the upcoming 7-day window. The computation uses:
- Updated trailing earnings (previous week's data is incorporated)
- Refreshed weather forecasts and zone data
- Updated Behavioral Score from the prior week
- Zone-level Loss Ratio check — if a zone's Loss Ratio exceeded 0.80 in the prior month, a zone-level surcharge of up to 8% is applied.

### How Pricing Adapts to User Behavior

The Behavioral Score creates a continuous feedback loop. Workers who follow recommendations and demonstrate consistent, lower-risk activity patterns see their premiums decrease over time, even if their base zone risk remains constant. Workers who exhibit patterns associated with higher platform costs (irregular activity, GPS inconsistencies, purchasing policies only before high-probability events) see their behavioral discount reduced or eliminated. This prevents adverse selection and keeps the platform sustainable.

---

## 9. Parametric Triggers

Triggers are the conditions that automatically activate a payout. Each trigger is defined by a condition, the data source used to evaluate it, and the payout logic that follows.

---

### Trigger 1: Sustained Rainfall Event

**Condition**: Rainfall intensity in the worker's primary operating zone exceeds 35 mm/hr for a sustained period of 90 or more consecutive minutes during the worker's active delivery window (6 AM to 10 PM).

**Data Used**: Weather API (OpenWeatherMap or mock), GPS-derived zone assignment, peer activity drop signal (corroborating condition — at least 30% drop in zone-level order acceptance required).

**Payout Logic**: If trigger is confirmed, payout = verified earnings shortfall for the affected window, capped at Expected Weekly Loss. Verification compares actual platform-reported earnings for the trigger day against the worker's daily earnings baseline. Payout transferred within 2 hours of trigger confirmation.

---

### Trigger 2: Air Quality Restriction

**Condition**: AQI in the worker's operating city crosses 300 (Very Poor or Severe category on India's NAQI scale) and a governmental or platform-level advisory restricts outdoor delivery activity for 2 or more hours during the worker's active window.

**Data Used**: Central Pollution Control Board AQI API (or mock feed), zone restriction status database, peer activity drop (corroborating condition).

**Payout Logic**: Proportional payout based on verified restricted hours as a fraction of expected daily hours. If 3 of 10 expected working hours are restricted, payout = 30% of daily expected earnings, applied for each day the condition is met, up to the Expected Weekly Loss ceiling.

---

### Trigger 3: Zone Shutdown or Curfew

**Condition**: An official municipal, state, or platform-imposed shutdown restricts delivery activity in the worker's declared primary zone for 4 or more consecutive hours on any day within the policy week.

**Data Used**: Zone status database (populated from civic authority feeds or platform announcements), worker's GPS-confirmed zone presence, peer activity data.

**Payout Logic**: Full daily earnings equivalent paid for each fully restricted day, prorated for partial shutdowns. Capped at Expected Weekly Loss across the week.

---

### Trigger 4: Demand Collapse

**Condition**: Platform-wide or zone-level order volume drops more than 50% below the zone's historical average for that time window for a sustained period of 3 or more hours. This must be corroborated by peer activity signals (more than 40% of enrolled workers in the zone showing near-zero activity).

**Data Used**: Simulated platform demand data feed, peer activity monitoring system, historical zone demand baseline.

**Payout Logic**: Payout proportional to the demand drop percentage applied to expected hourly earnings for the affected window, capped at Expected Weekly Loss. This trigger requires stronger peer corroboration than weather triggers due to the higher difficulty of external verification.

---

### Trigger 5: Extreme Heat Event

**Condition**: Temperature in the worker's operating zone exceeds 44 degrees Celsius for 4 or more consecutive hours between 11 AM and 4 PM, coinciding with a documented reduction in platform order acceptance rates.

**Data Used**: Weather API temperature data, peer activity data, historical heat event disruption patterns for the zone.

**Payout Logic**: Payout for hours within the extreme heat window where the worker's activity was below their hourly baseline, capped at Expected Weekly Loss. This trigger is designed primarily for northern Indian cities (Delhi, Lucknow, Jaipur) where summer heat is a documented income-disruption factor.

---

## 10. Fraud Detection

ShieldRide's parametric design reduces fraud risk significantly compared to indemnity insurance (there is no claim form to falsify), but the system still guards against gaming, coordinated fraud, and adverse selection.

### GPS Validation

Every active policy requires the worker to allow location access during their declared working hours. The system verifies that the worker's GPS signal places them within their declared operating zone during any period for which a payout is being calculated. A worker who is confirmed to be outside their declared zone (e.g., operating in a different city) during a triggered event will not receive a payout for that event. Consistent zone mismatch patterns are escalated to the fraud review queue.

### Activity Consistency Checks

If a trigger event occurs and a payout is initiated, the system cross-checks app activity logs (where available via worker consent), GPS movement patterns, and declared delivery platform sessions. A worker who shows continuous delivery activity at near-normal rates during a declared disruption window has their payout flagged. The threshold for flagging is: actual activity during the event window is more than 60% of the worker's baseline for that time slot.

### Peer Comparison

Payouts are validated against the zone-level peer group outcome for the same event. If a worker's claimed earnings shortfall is more than 2.5 standard deviations above the median shortfall for other workers in the same zone during the same event, the payout is held pending manual review. This catches both genuine outliers and potential fraud.

### Anomaly Detection — Adverse Selection Monitoring

An Isolation Forest model monitors policy purchase patterns across the user base. It flags users who:
- Consistently purchase policies within 24 hours of a high-probability weather event being forecasted
- Rarely purchase policies during low-risk periods
- Show a payout-to-premium ratio consistently above 2.0

Flagged users are subject to a 72-hour review period before new policies are activated. Confirmed adverse selection patterns result in a premium loading of up to 20% applied at the next renewal.

### Payout Hold and Review Process

Payouts flagged by any of the above mechanisms are held in a "pending" state for up to 24 hours while automated checks run. If automated checks are inconclusive, a human review queue is populated. For payouts below Rs. 500, automated approval is applied unless a fraud flag is active. For payouts above Rs. 2,000, dual-system confirmation (automated + peer comparison) is required before transfer.

---

## 11. Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with a custom design system
- **State Management**: Zustand for global state, React Query for server state
- **Progressive Web App**: Service Workers enabled for offline dashboard access
- **Charting**: Recharts for earnings and risk visualization
- **Maps**: Leaflet.js for zone-level visualization

### Backend

- **API Server**: Node.js with Express (TypeScript) for primary API gateway and business logic services
- **AI/ML Service**: Python 3.11 with FastAPI, handling risk scoring, earnings estimation, and fraud detection inference
- **Task Queue**: Bull (Redis-backed) for trigger evaluation jobs and scheduled pricing recalculation
- **Authentication**: JWT-based auth with refresh token rotation

### AI/ML

- **Risk Prediction**: XGBoost (scikit-learn compatible) trained on synthetic disruption-earnings data
- **Earnings Estimator**: Scikit-learn Linear Regression with interaction terms
- **Fraud / Anomaly Detection**: Scikit-learn Isolation Forest
- **Peer Signal Processing**: Custom rolling z-score implementation in NumPy/Pandas
- **Model Serving**: FastAPI endpoints with joblib model serialization

### Database

- **Primary Database**: PostgreSQL 15 — user profiles, policies, payout records, audit logs
- **Cache and Real-Time State**: Redis 7 — peer activity signals, trigger evaluation state, session cache
- **ORM**: Prisma (Node.js side), SQLAlchemy (Python side)

### External APIs and Data Sources

- **Weather**: OpenWeatherMap API (current + 7-day forecast) or mock data generator for offline demo
- **AQI**: CPCB AQI feed (mock feed for hackathon) or OpenAQ API
- **Zone Status**: Custom mock API simulating municipal zone shutdown data
- **Delivery Activity**: Synthetic delivery activity generator simulating Blinkit/Zepto-style data streams
- **GPS**: Browser Geolocation API with simulated GPS track playback for demo

### Payments

- **Payment Gateway**: Razorpay (test/sandbox mode) for UPI payout simulation
- **Payout Ledger**: Internal double-entry ledger in PostgreSQL for premium collection and payout tracking

### Infrastructure

- **Containerization**: Docker + Docker Compose for local development
- **Hosting**: Vercel (frontend), Railway or Render (backend services) for demo deployment
- **CI/CD**: GitHub Actions for lint, test, and deploy pipeline

---

## 12. User Flow

### Step 1: Onboarding

The worker downloads the ShieldRide PWA or accesses it via browser. They register with their mobile number (OTP-based verification). They declare:
- Primary and secondary delivery platforms
- Primary operating zone (city and locality)
- Typical working hours per day and days per week
- Estimated or documented average weekly earnings

The system runs an initial risk assessment and presents a welcome summary: estimated income risk level, typical disruption frequency for their zone, and an illustrative premium range.

### Step 2: Policy Creation

On the home screen, the worker sees their "This Week's Risk Forecast" — a plain-language summary of predicted disruption probability and estimated coverage recommendation. They tap "Get Protected" to view their personalized weekly premium and coverage details. The policy card shows: premium amount, trigger conditions, maximum payout amount, and behavioral recommendation for the week. The worker pays the premium (UPI, simulated in demo) and the policy activates immediately.

### Step 3: Live Monitoring

The active policy screen shows a real-time dashboard:
- Current weather and AQI conditions in their zone
- Trigger status indicators (each trigger shown as "Inactive / Monitoring / Alert / Triggered")
- Peer activity heatmap for their zone
- Today's estimated earnings versus their baseline
- This week's behavioral recommendation

The worker receives push notifications when any trigger enters "Alert" status (approaching threshold) and when a trigger is confirmed.

### Step 4: Disruption Detection

The Trigger Engine detects a rainfall event crossing the threshold. It checks peer corroboration data (zone-level activity drop confirmed). The fraud engine runs a GPS validation check (worker confirmed in declared zone). All checks pass.

### Step 5: Payout

The system calculates the verified earnings shortfall for the trigger window. Payout amount is computed (shortfall amount, capped at Expected Weekly Loss). A push notification is sent: "Rain payout of Rs. 420 is being processed." The Payout Service initiates a simulated UPI transfer. The payout appears in the worker's in-app wallet and is transferred to their linked bank account within 2 hours.

### Step 6: Feedback Loop

After the payout week closes, the system records:
- Actual earnings shortfall versus predicted
- Whether the worker followed the behavioral recommendation
- Peer group outcomes for the same event
- Trigger accuracy (did the external event actually match the measured impact?)

These inputs update the worker's risk profile, refine the pricing model for the next week, and contribute to zone-level model recalibration.

---

## 13. Dashboard Features

### Worker Dashboard

**Home Screen**
- Weekly Income Risk Score (Low / Moderate / High / Elevated)
- Active policy status and trigger conditions at a glance
- Earnings this week versus baseline (bar chart)
- Quick-access: "Buy Protection for Next Week" button

**Earnings Tracker**
- Multi-platform earnings aggregation (weekly and monthly view)
- Day-by-day earnings breakdown
- Baseline vs. actual comparison
- Disruption impact annotations on the earnings chart

**Risk Monitor**
- Live weather conditions in operating zone
- AQI status
- Zone restriction alerts
- Peer activity heatmap (anonymized, zone-level)
- Each parametric trigger with current status (Inactive / Alert / Triggered)

**My Policies**
- Active and historical policies
- Premium paid vs. payout received (total and by event)
- Policy detail view: trigger log, payout calculation breakdown

**Behavioral Hub**
- Current Behavioral Score
- This week's AI recommendation
- Compliance history
- Premium savings earned through behavioral discounts

**Payout History**
- All payouts received with date, trigger type, and amount
- Pending payouts and estimated transfer time
- In-app wallet balance

---

### Admin Dashboard

**Platform Overview**
- Total enrolled workers (by city and zone)
- Active policies this week
- Total premium collected vs. total payouts issued
- Overall Loss Ratio (platform and by zone)

**Risk and Actuarial View**
- Zone-level risk heatmap
- Weekly Loss Ratio trend chart
- Premium vs. payout scatter plot
- Zones with Loss Ratio above threshold (flagged for review)

**Trigger Monitoring**
- Real-time trigger status across all zones
- Trigger event log (type, zone, time, workers affected, total payout)
- Trigger accuracy analytics (predicted vs. realized disruption)

**Fraud and Compliance Queue**
- Payouts pending manual review
- Flagged accounts with fraud signal details
- Adverse selection watchlist
- Review action log

**User Management**
- Worker profiles with risk tier, Behavioral Score, policy history
- Bulk policy operations (zone-level adjustments)
- Support ticket integration

---

## 14. Future Scope

### 1. Direct Platform API Integrations

The current system relies on worker-declared earnings and synthetic data. The highest-impact near-term improvement is direct read access to earning data from Blinkit, Zepto, Swiggy Instamart, and BigBasket Now via formal API partnerships or open data frameworks. This would eliminate baseline estimation error, reduce fraud risk, and allow real-time payout calculation tied to verified platform earnings rather than GPS-and-peer proxies.

### 2. Advanced ML Models for Hyperlocal Risk

The current risk model operates at the locality level. A production-grade system would incorporate street-level flood risk maps, building-density data for wind and rain channeling effects, historical traffic disruption data, and event calendars (cricket matches, political rallies, festivals) that affect demand patterns. A spatial-temporal deep learning model (e.g., Graph Neural Network on a zone graph structure) would significantly improve prediction accuracy for microlocal disruptions.

### 3. Income Smoothing Financial Product

Beyond parametric insurance, ShieldRide could offer an income smoothing product: in high-earning weeks, workers contribute a small fraction to an escrow pool, which is disbursed in low-earning weeks regardless of whether a specific parametric trigger is met. This complements parametric coverage by addressing income variability that falls below trigger thresholds — the "bad week" scenario that is common but not necessarily caused by a discrete event.

### 4. Multi-City Expansion with Regional Risk Calendars

Each Indian city has its own disruption calendar — Bengaluru monsoon, Delhi winter fog and summer heat, Mumbai cyclone season, Chennai northeast monsoon. Scaling ShieldRide across cities requires city-specific risk models, trigger calibrations, and behavioral playbooks. A city-onboarding framework that allows rapid model initialization using regional weather archives and city-specific delivery platform activity data would make this scalable.

### 5. Regulatory Framework and IRDAI Compliance

ShieldRide is architecturally designed as a parametric product, which has a clearer regulatory path in India than indemnity insurance. Future development would involve engaging with the Insurance Regulatory and Development Authority of India (IRDAI) sandbox framework, partnering with a licensed insurer as the risk-carrying entity, and ensuring the product meets the disclosure, grievance redressal, and capital adequacy requirements for a formal insurance offering. This would allow ShieldRide to be sold as a regulated product rather than a platform-side benefit, giving workers full legal protection.

---

## Appendix: Glossary

**Parametric Insurance**: A type of insurance where payouts are triggered automatically by the occurrence of a pre-defined measurable event (e.g., rainfall above a threshold), regardless of the actual individual loss incurred. Distinct from indemnity insurance, which requires a claim and loss assessment.

**Risk Score**: A computed multiplier (0.5 to 1.5) representing the elevated or reduced likelihood of a disruption event for a specific worker in a specific zone during a specific week.

**Behavioral Score**: A 0-to-100 score reflecting how consistently a worker follows AI-generated income-protection recommendations. Drives premium discounts.

**Loss Ratio**: The ratio of total payouts to total premiums collected. A key actuarial sustainability metric for the platform.

**Expected Lost Hours**: The AI-estimated number of delivery hours a worker will be unable to work due to a disruption event in the upcoming week, derived from disruption probability and historical event duration.

**Peer Signal**: Anonymized, aggregated activity metrics from nearby enrolled workers used as a hyperlocal, real-time disruption detection input.

---

*Built for the hackathon by Team ShieldRide. All external data integrations use public APIs or mock data generators. Payment flows use Razorpay test/sandbox mode. No real financial transactions are processed.*
