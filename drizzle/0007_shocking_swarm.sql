ALTER TABLE "articles" ADD COLUMN "normalized_title" text;--> statement-breakpoint
UPDATE "articles" SET "normalized_title" = (
  SELECT string_agg(word, ' ' ORDER BY word)
  FROM unnest(string_to_array(trim(regexp_replace(lower("title"), '[^a-z0-9]+', ' ', 'g')), ' ')) AS word
  WHERE word <> ''
);--> statement-breakpoint
ALTER TABLE "articles" ALTER COLUMN "normalized_title" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "articles_normalized_title_idx" ON "articles" USING btree ("normalized_title");
