# Submission Note — Skillpath Developer Role

### 1. What I'd fix with two more days
With two additional days, I would implement:
- **Optimistic Stale-While-Revalidate (SWR) caching with LocalStorage**: Keep previously loaded courses visible while retrying in the background to minimize perceived flakiness.
- **Exponential backoff with jitter on 500/404 errors**: Automatically recover from transient gateway spikes before requiring the learner to hit "Retry".
- **Dynamic Category Pills derived from Framer controls**: Allow designers to preset curated filter taxonomies directly in the canvas property inspector.

### 2. Where I got stuck
Handling the decoupled failure mode between `/assignment/country-code` and `/assignment/course-data`. Initially, a unified `Promise.all` aborted the entire view if the country endpoint returned a 500 or 404. Decoupling the requests into independent async flows with a resilient fallback (`INR`/`USD` based on property control or browser locale) ensured course content renders uninterrupted even when country resolution fails.

### 3. What I'm not happy with
The card footer layout when course titles differ drastically in length. While CSS `-webkit-line-clamp: 2` cleanly cuts descriptions, very long course titles create subtle vertical height differences across grid rows. Using subgrid or an enforced minimum title container height solves this cleanly.
