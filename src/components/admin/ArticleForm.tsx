import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import TipTapEditor from './TipTapEditor';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

const CATEGORIES = [
  'AI', 'Hardware', 'Web Dev', 'Security', 'Design',
  'Video', 'Laptops', 'Events', 'Mobile', 'Cloud', 'Other',
];

export interface ArticleData {
  id?: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  coverImage: string;
  published: boolean;
}

interface ArticleFormProps {
  initialData?: ArticleData;
  articleId?: number;
  mode: 'create' | 'edit';
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function ArticleForm(props: ArticleFormProps) {
  const { initialData, mode } = props;
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [slugManual, setSlugManual] = useState(!!initialData?.slug);
  const [content, setContent] = useState(initialData?.content ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (mode === 'edit' && props.articleId) {
      const stored = localStorage.getItem('admin_articles');
      if (stored) {
        const allArticles = JSON.parse(stored);
        const article = allArticles.find((a: any) => a.id === props.articleId);
        if (article) {
          setTitle(article.title);
          setSlug(article.slug);
          setContent(article.content);
          setCategory(article.category);
          setCoverImage(article.coverImage ?? '');
          setPublished(article.published);
        }
      }
    }
  }, [mode, props.articleId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManual(true);
    setSlug(e.target.value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();
      setCoverImage(url);
      toast.success('Cover image uploaded');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!slug.trim()) { toast.error('Slug is required'); return; }
    if (!content.trim() || content === '<p></p>') { toast.error('Content is required'); return; }
    if (!category) { toast.error('Category is required'); return; }

    setSubmitting(true);
    try {
      const stored = localStorage.getItem('admin_articles');
      let allArticles = stored ? JSON.parse(stored) : [];

      if (mode === 'edit') {
        const id = initialData?.id || props.articleId;
        const index = allArticles.findIndex((a: any) => a.id === id);
        if (index !== -1) {
          allArticles[index] = {
            ...allArticles[index],
            title, slug, content, category, coverImage, published,
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        const newArticle = {
          id: Date.now(),
          title, slug, content, category, coverImage, published,
          views: 0, likes: 0, commentsCount: 0,
          sortOrder: allArticles.length > 0 ? Math.max(...allArticles.map((a: any) => a.sortOrder ?? 0)) + 1 : 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        allArticles.unshift(newArticle);
      }

      localStorage.setItem('admin_articles', JSON.stringify(allArticles));

      toast.success(mode === 'edit' ? 'Article updated successfully!' : 'Article created successfully!');

      setTimeout(() => {
        window.location.href = '/admin/articles';
      }, 1000);
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="article-title">Title *</Label>
        <Input
          id="article-title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter article title..."
          required
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="article-slug">Slug *</Label>
          <span className="text-xs text-muted-foreground">Auto-generated from title</span>
        </div>
        <div className="flex w-full">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-secondary px-3 text-sm text-muted-foreground">
            /article/
          </span>
          <Input
            id="article-slug"
            value={slug}
            onChange={handleSlugChange}
            placeholder="article-slug"
            className="rounded-l-none"
            required
          />
        </div>
      </div>

      {/* Category + Published row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="article-category">Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="article-category">
              <SelectValue placeholder="Select category…" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="article-published">Status</Label>
          <div className="flex items-center gap-3 h-9">
            <Switch id="article-published" checked={published} onCheckedChange={setPublished} />
            <span className="text-sm text-foreground">{published ? 'Published' : 'Draft'}</span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="outline" size="sm" asChild className="cursor-pointer" disabled={uploading}>
            <label>
              {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
              {uploading ? 'Uploading…' : 'Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </Button>
          {coverImage && (
            <div className="flex items-center gap-2">
              <img src={coverImage} alt="Cover preview" className="h-12 w-20 object-cover rounded-lg border border-border" />
              <Button type="button" variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setCoverImage('')}>
                <X />
              </Button>
            </div>
          )}
          {!coverImage && (
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Or paste image URL…"
              className="flex-1 min-w-48"
            />
          )}
        </div>
      </div>

      {/* TipTap Content */}
      <div className="space-y-2">
        <Label>Content *</Label>
        <TipTapEditor initialContent={content} onChange={setContent} placeholder="Start writing your article…" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pt-2">
        <Button variant="ghost" asChild>
          <a href="/admin/articles">Cancel</a>
        </Button>
        <Button type="submit" id="article-submit" loading={submitting}>
          {mode === 'edit' ? 'Update Article' : published ? 'Publish Article' : 'Save Draft'}
        </Button>
      </div>
    </form>
  );
}
