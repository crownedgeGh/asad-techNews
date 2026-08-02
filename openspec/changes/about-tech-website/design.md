## Context

This design outlines the architecture and key technical decisions for "AboutTech," a modern tech news website. The project relies on a full-stack configuration prioritizing speed, a modern aesthetic, and efficient content management. The core tech stack consists of Bun (runtime/package manager), Astro (frontend framework), Tailwind CSS v4 (styling), Neon DB (serverless Postgres), R2 Storage (media), and an image compression pipeline using the `sharp` library via Vercel functions.

## Goals / Non-Goals

**Goals:**
- Deliver a fast, fully responsive, minimal, and modern tech news platform.
- Build a robust content authoring experience using the Tiptap editor.
- Implement an optimized media upload and delivery workflow with R2 Storage and on-the-fly image compression.
- Integrate Google Ads seamlessly without compromising the UX.
- Establish a database schema for articles, categories, and potentially comments and users (authors).

**Non-Goals:**
- Complex user authentication for standard readers (only authors/admins need auth initially).
- A bespoke ad-serving engine (relying on Google Ads).
- Native mobile applications (relying on responsive web design).

## Decisions

**1. Framework: Astro + Bun**
- *Rationale:* Astro is ideal for content-heavy sites due to its zero-JS by default approach (Islands architecture), resulting in excellent performance and SEO. Bun provides a fast runtime and package management, reducing build times.
- *Alternatives:* Next.js (heavier for static/content-driven sites).

**2. Database: Neon DB**
- *Rationale:* Serverless Postgres is highly scalable and cost-effective, with excellent branching features for development.
- *Alternatives:* SQLite (lacks scalability for a growing content site), MongoDB (relational data like authors/articles fits Postgres better).

**3. Media & Storage: Cloudflare R2 + Vercel Functions + Sharp**
- *Rationale:* R2 offers egress-free object storage, reducing costs compared to AWS S3. Using a Vercel serverless function with `sharp` allows us to compress images on upload before storing them in R2.
- *Alternatives:* Next/Image (since we use Astro, a custom pipeline or Astro's image service combined with R2 is necessary).

**4. Editor: Tiptap**
- *Rationale:* Tiptap is a headless, highly customizable rich-text editor based on ProseMirror, ideal for creating a bespoke writing experience for tech articles.
- *Alternatives:* Quill, TinyMCE (less customizable, heavier).

## Risks / Trade-offs

- **Risk: Image Compression Latency** -> *Mitigation:* Ensure the Vercel function handles uploads asynchronously or is adequately resourced. Set strict file size limits on the client side before upload.
- **Risk: Ad Layout Shift (CLS)** -> *Mitigation:* Pre-allocate space (min-height/min-width) for Google Ad slots to prevent Cumulative Layout Shift, preserving the "smooth on screen" user experience and SEO scores.
- **Risk: Styling Inconsistencies with Tiptap** -> *Mitigation:* Use `@tailwindcss/typography` (prose classes) customized to match our specific typography choices (Merriweather, Inter, etc.) for rendered article content.
