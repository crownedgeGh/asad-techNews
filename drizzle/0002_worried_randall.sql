CREATE TABLE "link_previews" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"description" text,
	"image" text,
	"site_name" text,
	"embed_url" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "link_previews_url_unique" UNIQUE("url")
);
