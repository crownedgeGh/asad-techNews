## Why

We need to build "AboutTech", a modern, fully responsive tech news website to provide users with up-to-date tech news, AI tool launches, and product reviews. A custom platform allows for optimal performance, specific monetization strategies (Google Ads), and a unique modern minimal design that differentiates it from typical news websites.

## What Changes

- Set up a new full-stack project using Bun and Astro.
- Integrate Tailwind CSS v4 for styling, supporting both light and dark modes.
- Configure Neon DB for database storage and R2 Storage for media.
- Implement an image compression workflow using the `sharp` library via Vercel functions.
- Build the Home Page layout (Trending, Tech News, AI Tools, Reviews, General).
- Build the Article Page layout (Title, Author, Media, Content with Tiptap editor, Like/Share, Comments, Related Articles).
- Integrate Google Ads on the right side and between article paragraphs.
- Apply modern minimal typography (Merriweather, Georgia, Source Serif 4, Lora, Inter, Roboto).

## Capabilities

### New Capabilities
- `home-page`: The main landing page with categorized news feeds (Trending, Tech News, AI Tools, Reviews, General).
- `article-page`: Detailed view for reading news, complete with author info, comments, related articles, and share buttons.
- `content-management`: Article writing using Tiptap editor and image uploads with compression.
- `monetization`: Google Ads integration in the UI.

### Modified Capabilities
- None

## Impact

- Establishes the entire core architecture and tech stack for the new AboutTech website.
- Introduces new database schemas and storage buckets for content and media.
