import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Upload, X, Loader2, Eye } from 'lucide-react';
import TipTapEditor from './TipTapEditor';
import { ArticlePreviewModal } from './ArticlePreviewModal';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { CATEGORIES } from '../../lib/categories';
import { AdminStoreProvider } from '../../store/AdminStoreProvider';
import { useAppDispatch, useAppSelector } from '../../store';
import { setArticleDetailCache, clearArticleDetailCache, clearArticlesListCache } from '../../store/slices/adminSlice';

// Cached article detail is shown instantly; entries older than this are refreshed silently in the background.
const FRESH_MS = 30_000;

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

function ArticleFormInner(props: ArticleFormProps) {
  const { initialData, mode } = props;
  const dispatch = useAppDispatch();
  const cached = useAppSelector((s) =>
    mode === 'edit' && props.articleId ? s.admin.articleDetailCache[props.articleId] : undefined
  );
  const cachedArticle = initialData ?? cached?.article;

  const [title, setTitle] = useState(cachedArticle?.title ?? '');
  const [slug, setSlug] = useState(cachedArticle?.slug ?? '');
  const [slugManual, setSlugManual] = useState(!!cachedArticle?.slug);
  const [content, setContent] = useState(cachedArticle?.content ?? '');
  const [category, setCategory] = useState(cachedArticle?.category ?? '');
  const [coverImage, setCoverImage] = useState(cachedArticle?.coverImage ?? '');
  const [published, setPublished] = useState(cachedArticle?.published ?? false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(mode === 'edit' && !cachedArticle);
  const [previewOpen, setPreviewOpen] = useState(false);

  React.useEffect(() => {
    if (mode !== 'edit' || !props.articleId || initialData) return;

    const applyArticle = (article: any) => {
      setTitle(article.title);
      setSlug(article.slug);
      setSlugManual(true);
      setContent(article.content);
      setCategory(article.category);
      setCoverImage(article.coverImage ?? '');
      setPublished(article.published);
    };

    const loadFresh = (silent: boolean) =>
      fetch(`/api/admin/articles/${props.articleId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load article');
          return res.json();
        })
        .then((article) => {
          applyArticle(article);
          dispatch(setArticleDetailCache({ id: props.articleId!, entry: { article, fetchedAt: Date.now() } }));
        })
        .catch(() => {
          if (!silent) toast.error('Failed to load article');
        })
        .finally(() => setLoadingArticle(false));

    if (cached) {
      // Cache hit: fields are already populated from cachedArticle above, no spinner needed.
      setLoadingArticle(false);
      if (Date.now() - cached.fetchedAt > FRESH_MS) loadFresh(true);
    } else {
      loadFresh(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, props.articleId, initialData]);

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
      toast.success('Cover image converted to WebP and uploaded');
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
      const id = initialData?.id ?? props.articleId;
      const url = mode === 'edit' ? `/api/admin/articles/${id}` : '/api/admin/articles';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, content, category, coverImage, published }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Something went wrong');
      }

      toast.success(mode === 'edit' ? 'Article updated successfully!' : 'Article created successfully!');

      // Data changed — drop cached list/detail results so the articles page and any
      // other tabs on this device re-fetch instead of showing stale cached content.
      dispatch(clearArticlesListCache());
      if (id) dispatch(clearArticleDetailCache(id));

      setTimeout(() => {
        window.location.href = '/admin/articles';
      }, 1000);
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingArticle) {
    return (
      <div className="flex items-center justify-center py-24 text-base-content/60">
        <Loader2 className="animate-spin mr-2" /> Loading article…
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Preview */}
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
          <Eye /> Preview
        </Button>
      </div>

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
          <span className="text-xs text-base-content/60">Auto-generated from title</span>
        </div>
        <div className="flex w-full">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-base-300 bg-base-200 px-3 text-sm text-base-content/60">
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
            <span className="text-sm text-base-content">{published ? 'Published' : 'Draft'}</span>
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
              {uploading ? 'Converting to WebP…' : 'Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </Button>
          {coverImage && (
            <div className="flex items-center gap-2">
              <img src={coverImage} alt="Cover preview" className="h-12 w-20 object-cover rounded-lg border border-base-300" />
              <Button type="button" variant="ghost" size="icon-sm" className="text-error" onClick={() => setCoverImage('')}>
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

    <ArticlePreviewModal
      open={previewOpen}
      onOpenChange={setPreviewOpen}
      title={title}
      category={category}
      coverImage={coverImage}
      content={content}
      published={published}
    />
    </>
  );
}

export default function ArticleForm(props: ArticleFormProps) {
  return (
    <AdminStoreProvider>
      <ArticleFormInner {...props} />
    </AdminStoreProvider>
  );
}
