import React, { useState, useEffect, useCallback } from 'react';
import { AdminTable, type Column } from './AdminTable';
import { ConfirmModal } from './ConfirmModal';
import { ToastProvider, useToast } from './Toast';

interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  views: number;
  likes: number;
  commentsCount: number;
  sortOrder: number;
  createdAt: string;
}

function ArticlesTableInner() {
  const { showToast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const pageSize = 15;

  const fetchArticles = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles?page=${p}`);
      const data = await res.json();
      setArticles(data.articles ?? []);
      setTotal(data.total ?? 0);
    } catch {
      showToast('Failed to load articles', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(page);
  }, [page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setTotal((t) => t - 1);
      showToast(`"${deleteTarget.title}" deleted`, 'success');
    } catch {
      showToast('Failed to delete article', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleReorder = async (article: Article, direction: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error();
      // Re-fetch to get updated order
      await fetchArticles(page);
    } catch {
      showToast('Failed to reorder article', 'error');
    }
  };

  const columns: Column<Article>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (a) => (
        <div>
          <p className="font-medium text-sm text-base-content line-clamp-1 max-w-xs">{a.title}</p>
          <p className="text-xs text-base-content/40 mt-0.5">{a.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (a) => (
        <span className="badge badge-outline badge-sm">{a.category}</span>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      className: 'text-center',
      render: (a) => (
        <span className="text-sm font-mono">{a.views.toLocaleString()}</span>
      ),
    },
    {
      key: 'likes',
      header: 'Likes',
      className: 'text-center',
      render: (a) => (
        <span className="text-sm font-mono">{a.likes.toLocaleString()}</span>
      ),
    },
    {
      key: 'comments',
      header: 'Comments',
      className: 'text-center',
      render: (a) => (
        <span className="text-sm font-mono">{a.commentsCount.toLocaleString()}</span>
      ),
    },
    {
      key: 'published',
      header: 'Status',
      render: (a) => (
        <span className={`badge badge-sm ${a.published ? 'badge-success' : 'badge-warning'}`}>
          {a.published ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (a, index) => (
        <div className="flex items-center gap-1 flex-wrap">
          <a href={`/admin/articles/${a.id}`} className="btn btn-ghost btn-xs gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </a>
          <a href={`/admin/articles/${a.id}/edit`} className="btn btn-ghost btn-xs gap-1 text-info">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </a>
          <button
            onClick={() => setDeleteTarget(a)}
            className="btn btn-ghost btn-xs gap-1 text-error"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => handleReorder(a, 'up')}
              disabled={index === 0}
              className="btn btn-ghost btn-xs py-0 h-5 min-h-0 disabled:opacity-30"
              title="Move up"
            >▲</button>
            <button
              onClick={() => handleReorder(a, 'down')}
              disabled={index === articles.length - 1}
              className="btn btn-ghost btn-xs py-0 h-5 min-h-0 disabled:opacity-30"
              title="Move down"
            >▼</button>
          </div>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <AdminTable columns={columns} data={articles} loading={loading} emptyMessage="No articles yet. Create your first one!" />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="join">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`join-item btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default function ArticlesTable() {
  return (
    <ToastProvider>
      <ArticlesTableInner />
    </ToastProvider>
  );
}
