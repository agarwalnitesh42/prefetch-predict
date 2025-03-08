class PredictivePrefetcher {
    constructor(options = {}) {
        this.maxPrefetch = options.maxPrefetch || 3; // Limit concurrent prefetches
        this.decayRate = options.decayRate || 0.1;   // Decay rate for predictions
        this.transitions = new Map();                // Markov chain: {state -> {next -> count}}
        this.resources = new Map();                  // Resource metadata: {url -> {size, latency, lastUsed}}
        this.currentState = null;                    // Current page/event
    }

    // Track a navigation event or state
    track(eventType, state) {
        if (this.currentState && this.currentState !== state) {
            // Update transition counts for Markov chain
            const nextMap = this.transitions.get(this.currentState) || new Map();
            const count = nextMap.get(state) || 0;
            nextMap.set(state, count + 1);
            this.transitions.set(this.currentState, nextMap);
        }
        this.currentState = state;
    }

    // Add a resource to prefetch pool with metadata
    addResource(url, { size = 100, latency = 100 } = {}) {
        this.resources.set(url, {
            size,
            latency,
            lastUsed: Date.now(),
        });
    }

    // Predict next states using Markov chain
    predictNext() {
        if (!this.currentState || !this.transitions.has(this.currentState)) {
            return [];
        }

        const nextMap = this.transitions.get(this.currentState);
        const totalTransitions = Array.from(nextMap.values()).reduce((sum, count) => sum + count, 0);
        const predictions = [];

        // Calculate transition probabilities
        for (const [nextState, count] of nextMap) {
            const probability = count / totalTransitions;
            predictions.push({ state: nextState, probability });
        }

        // Sort by probability descending
        return predictions.sort((a, b) => b.probability - a.probability);
    }

    // Score resources based on prediction, decay, and cost
    scoreResources(predictions) {
        const scores = [];
        const now = Date.now();

        for (const { state, probability } of predictions) {
            for (const [url, { size, latency, lastUsed }] of this.resources) {
                if (url.includes(state)) { // Simple match: resource tied to state
                    // Time decay: e^(-λ * time_elapsed)
                    const timeElapsed = (now - lastUsed) / 1000; // Seconds
                    const decay = Math.exp(-this.decayRate * timeElapsed);
                    // Score: probability * decay / cost (size * latency)
                    const cost = size * latency;
                    const score = (probability * decay) / (cost || 1); // Avoid division by 0
                    scores.push({ url, score });
                }
            }
        }

        // Sort by score descending
        return scores.sort((a, b) => b.score - a.score);
    }

    // Prefetch top resources
    async prefetch(urls) {
        const toFetch = urls.slice(0, this.maxPrefetch);
        const promises = toFetch.map(({ url }) =>
            fetch(url, { mode: 'no-cors' }) // Prefetch without blocking
                .then(() => {
                    const resource = this.resources.get(url);
                    if (resource) resource.lastUsed = Date.now(); // Update last used
                    console.log(`Prefetched: ${url}`);
                })
                .catch((err) => console.warn(`Prefetch failed: ${url}`, err))
        );
        await Promise.all(promises);
    }

    // Main method: optimize and prefetch
    async optimize() {
        const predictions = this.predictNext();
        if (predictions.length === 0) {
            console.log('No predictions yet—need more tracking data.');
            return;
        }
        const scoredResources = this.scoreResources(predictions);
        if (scoredResources.length === 0) {
            console.log('No matching resources to prefetch.');
            return;
        }
        await this.prefetch(scoredResources);
    }
}

// Export
module.exports = { PredictivePrefetcher };