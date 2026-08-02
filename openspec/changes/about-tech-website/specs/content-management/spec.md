## ADDED Requirements

### Requirement: Rich Text Editing
The system SHALL provide an authoring interface using the Tiptap editor.

#### Scenario: Author writes an article
- **WHEN** an author accesses the article creation interface
- **THEN** they can use a rich text editor (Tiptap) to format text, add headings, blockquotes, and media.

### Requirement: Image Upload & Compression
The system SHALL compress images upon upload to optimize storage and delivery.

#### Scenario: Author uploads an image
- **WHEN** an author uploads an image via the editor or cover image field
- **THEN** the system uses a Vercel function and `sharp` to compress the image before saving it to R2 Storage.
