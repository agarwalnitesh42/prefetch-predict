# prefetch-predict

[![npm version](https://badge.fury.io/js/prefetch-predict.svg)](https://www.npmjs.com/package/prefetch-predict)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/your-username/prefetch-predict.svg?branch=main)](https://travis-ci.org/your-username/prefetch-predict)

**prefetch-predict** is a lightweight, dependency-free JavaScript library designed to enhance web application performance by intelligently prefetching resources based on user behavior. Leveraging advanced mathematical models like Markov chains, time-decay functions, and cost-benefit analysis, it predicts and preloads the most likely next resources, reducing load times and improving user experience.

---

## Motivation

Slow page loads and resource delays are a critical pain point in modern web development. Studies show that 53% of users abandon a site if it takes more than 3 seconds to load, and Google penalizes slow sites in search rankings. Traditional prefetching (e.g., `<link rel="prefetch">`) is static and wasteful, often loading unnecessary resources or missing critical ones. `prefetch-predict` solves this by:

- **Predicting User Behavior**: Adapts to real navigation patterns.
- **Optimizing Resources**: Balances probability, recency, and cost.
- **Staying Lightweight**: No external dependencies, pure JS.

This plugin is built for developers who need a smart, performant solution without the bloat of heavier frameworks.

---

## Features

- **Predictive Modeling**: Uses Markov chains to forecast the next page or resource.
- **Dynamic Prioritization**: Scores resources with a formula combining probability, time-decay (`e^(-λt)`), and cost (size * latency).
- **Configurable**: Adjust prefetch limits and decay rates to suit your app.
- **Universal**: Works in browsers and Node.js (e.g., for SSR).
- **Zero Dependencies**: Built from scratch in pure JavaScript.
- **Real-Time Adaptation**: Updates predictions as users interact.

---

## Installation

### Via npm

```bash
npm install prefetch-predict
```

## Via CDN (Post-Publishing)
```bash
<script type="module" src="https://unpkg.com/prefetch-predict@1.0.0/index.js"></script>
```

## Manual Download
- Clone or download from GitHub:
```bash
git clone https://github.com/agarwalnitesh42/prefetch-predict.git
cd prefetch-predict
```

## Usage
- Quick Start
```bash
import { PredictivePrefetcher } from 'prefetch-predict';

const prefetcher = new PredictivePrefetcher({
  maxPrefetch: 2,    // Limit to 2 concurrent prefetches
  decayRate: 0.05,   // Predictions fade slowly
});

// Simulate user navigation
prefetcher.track('pageview', '/home');
prefetcher.track('pageview', '/products');
prefetcher.track('pageview', '/home');
prefetcher.track('pageview', '/products');

// Register resources
prefetcher.addResource('/api/products', { size: 500, latency: 200 });
prefetcher.addResource('/images/hero.jpg', { size: 1000, latency: 300 });

// Run optimization
prefetcher.optimize().then(() => {
  console.log('Prefetching complete!');
});
```

- **Output**: After learning the pattern (/home → /products is frequent), it prefetches /api/products due to its higher score.

## Real-World Browser Example
Integrate with a single-page app:

```bash
<!DOCTYPE html>
<html>
<head>
  <title>Prefetch Predict Demo</title>
</head>
<body>
  <a href="/home">Home</a>
  <a href="/products">Products</a>
  <script type="module">
    import { PredictivePrefetcher } from './index.js';

    const prefetcher = new PredictivePrefetcher({
      maxPrefetch: 3,
      decayRate: 0.1,
    });

    // Track clicks
    document.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault(); // For demo
        prefetcher.track('click', link.pathname);
        prefetcher.optimize();
      });
    });

    // Add resources
    prefetcher.addResource('/api/home', { size: 200, latency: 150 });
    prefetcher.addResource('/api/products', { size: 500, latency: 200 });
    prefetcher.addResource('/images/product.jpg', { size: 800, latency: 250 });

    // Initial prefetch on load
    window.addEventListener('load', () => prefetcher.optimize());
  </script>
</body>
</html>
```
## API Reference
**new PredictivePrefetcher(options)**
Initializes the prefetcher.

- options (object, optional):
  - maxPrefetch (number): Maximum resources to prefetch at once. Default: 3.
  - decayRate (number): Rate at which prediction scores decay over time. Default: 0.1.

## Example:

```bash
const prefetcher = new PredictivePrefetcher({ maxPrefetch: 5 });
```

**.track(eventType, state)**
Logs a navigation event to build the prediction model.

- eventType (string): Event category (e.g., 'pageview', 'click').
- state (string): Current state or URL (e.g., '/products').
Example:

```bash
prefetcher.track('pageview', '/about');
```

**.addResource(url, metadata)**
Registers a resource for potential prefetching.

- url (string): Resource URL.
- metadata (object, optional):
  - size (number): Estimated size in bytes. Default: 100.
  - latency (number): Estimated latency in milliseconds. Default: 100.

## Example:
```bash
prefetcher.addResource('/scripts/main.js', { size: 300, latency: 120 });
```

**.optimize()**
Predicts, scores, and prefetches resources. Returns a Promise.
```bash
await prefetcher.optimize();
```

## How It Works

1. **Tracking**: Records transitions (e.g., /home → /products) in a Markov chain stored as a nested **Map**.

2. **Prediction**: Calculates transition probabilities (e.g., P(/products|/home) = count / total).

3. **Scoring**: Ranks resources using:
    - Probability: From Markov chain.
    - Time-Decay**: **score = probability * e^(-λ * time_elapsed)** where **λ** is **decayRate**.
    - Cost: (probability * decay) / (size * latency).

4. Prefetching: Uses fetch with no-cors mode to preload the top **maxPrefetch** resources.

## Math Example:

- **Transition**: /home → /products (3 times out of 4).
- **Probability**: P = 3/4 = 0.75.
- **Time since last use**: 10s, decay = e^(-0.1 * 10) ≈ 0.368.
- **Resource cost**: size = 500, latency = 200, cost = 100000.
- **Final score**: (0.75 * 0.368) / 100000 ≈ 0.00000276.

## Configuration Tips
- Small maxPrefetch: Use 1-3 for mobile or low-bandwidth users.
- High decayRate: Set 0.2+ for fast-changing apps (e.g., news sites).
- Resource Metadata: Estimate size and latency from network logs for accuracy.

## Development
**Prerequisites**
- Node.js 14+ (for ES modules support).

## Setup
1. Clone the repository:
```bash
git clone https://github.com/agarwalnitesh42/prefetch-predict.git
cd prefetch-predict
```

2. Install (no dependencies, but for dev tools):
```bash
npm install
```

3. Run a test script:
```bash
node --experimental-modules test.js
```

## Testing
```bash
import { PredictivePrefetcher } from './index.js';

const p = new PredictivePrefetcher();
p.track('pageview', '/a');
p.track('pageview', '/b');
p.addResource('/api/b', { size: 100, latency: 50 });
p.optimize();
```

Run: **node --experimental-modules test.js**.

## Building
No build step required—pure JS!

## Contributing
We welcome contributions! To get started:

1. Fork the repo.
2. Create a feature branch (git checkout -b feature-name).
3. Commit changes (git commit -m "Add feature X").
4. Push (git push origin feature-name).
5. Open a pull request.

## Guidelines:

- Use ES6+ syntax.
- Keep it dependency-free.
- Add comments for complex logic.
- Write tests (TBD).

## License
**MIT License** © [Nitesh Agarwal] 2025

## Roadmap
- v1.1: Multi-step Markov predictions for deeper forecasting.
- v1.2: Support <link> prefetching alongside fetch.
- v1.3: Add unit tests with Jest or Mocha.
- v2.0: Real-time latency/size measurement from network responses.

## Acknowledgments
- Inspired by the need for smarter web performance tools.
- Built with love by [Nitesh Agarwal] using pure JavaScript.

## Contact
GitHub: agarwalnitesh42
Email: agarwalnitesh42@gmail.com
Issues: File a bug or feature request
