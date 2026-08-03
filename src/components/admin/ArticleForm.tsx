import React, { useState, useCallback } from 'react';
import TipTapEditor from './TipTapEditor';
import { ToastProvider, useToast } from './Toast';

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

function ArticleFormInner({ initialData, mode }: ArticleFormProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [slugManual, setSlugManual] = useState(!!initialData?.slug);
  const [content, setContent] = useState(initialData?.content ?? '');
  const [category, setCategory] = useState(initialData?.category ?? '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      showToast('Cover image uploaded', 'success');
    } catch {
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { showToast('Title is required', 'error'); return; }
    if (!slug.trim()) { showToast('Slug is required', 'error'); return; }
    if (!content.trim() || content === '<p></p>') { showToast('Content is required', 'error'); return; }
    if (!category) { showToast('Category is required', 'error'); return; }

    setSubmitting(true);
    try {
      const url = mode === 'edit'
        ? `/api/admin/articles/${initialData!.id}`
        : '/api/admin/articles';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, content, category, coverImage, published }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to save article');
      }

      showToast(
        mode === 'edit' ? 'Article updated successfully!' : 'Article created successfully!',
        'success'
      );

      // Redirect after short delay for toast to show
      setTimeout(() => {
        window.location.href = '/admin/articles';
      }, 1000);
    } catch (err: any) {
      showToast(err.message ?? 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="form-control">
        <label className="label"><span className="label-text font-semibold">Title *</span></label>
        <input
          type="text"
          id="article-title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter article title..."
          className="input input-bordered w-full"
          required
        />
      </div>

      {/* Slug */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold">Slug *</span>
          <span className="label-text-alt text-base-content/40">Auto-generated from title</span>
        </label>
        <div className="join w-full">
          <span className="join-item btn btn-disabled no-animation px-3 text-base-content/40 text-sm">/article/</span>
          <input
            type="text"
            id="article-slug"
            value={slug}
            onChange={handleSlugChange}
            placeholder="article-slug"
            className="input input-bordered join-item w-full"
            required
          />
        </div>
      </div>

      {/* Category + Published row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label"><span className="label-text font-semibold">Category *</span></label>
          <select
            id="article-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select select-bordered w-full"
            required
          >
            <option value="" disabled>Select category…</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text font-semibold">Status</span></label>
          <label className="label cursor-pointer gap-4 justify-start">
            <input
              type="checkbox"
              id="article-published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="toggle toggle-success"
            />
            <span className="label-text">{published ? 'Published' : 'Draft'}</span>
          </label>
        </div>
      </div>

      {/* Cover Image */}
      <div className="form-control">
        <label className="label"><span className="label-text font-semibold">Cover Image</span></label>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="btn btn-outline btn-sm gap-2 cursor-pointer">
            {uploading ? (
              <><span className="loading loading-spinner loading-xs"></span> Uploading…</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> Upload Image</>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
          {coverImage && (
            <div className="flex items-center gap-2">
              <img src={coverImage} alt="Cover preview" className="h-12 w-20 object-cover rounded-lg border border-base-300" />
              <button type="button" onClick={() => setCoverImage('')} className="btn btn-ghost btn-xs text-error">✕</button>
            </div>
          )}
          {!coverImage && (
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Or paste image URL…"
              className="input input-bordered input-sm flex-1 min-w-48"
            />
          )}
        </div>
      </div>

      {/* TipTap Content */}
      <div className="form-control">
        <label className="label"><span className="label-text font-semibold">Content *</span></label>
        <TipTapEditor
          initialContent={content}
          onChange={setContent}
          placeholder="Start writing your article…"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end pt-2">
        <a href="/admin/articles" className="btn btn-ghost">Cancel</a>
        <button
          type="submit"
          id="article-submit"
          disabled={submitting}
          className="btn btn-primary gap-2"
        >
          {submitting && <span className="loading loading-spinner loading-xs"></span>}
          {mode === 'edit' ? 'Update Article' : published ? 'Publish Article' : 'Save Draft'}
        </button>
      </div>
    </form>
  );
}

export default function ArticleForm(props: ArticleFormProps) {
  return (
    <ToastProvider>
      <ArticleFormInner {...props} />
    </ToastProvider>
  );
}
