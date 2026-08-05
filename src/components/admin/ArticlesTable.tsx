import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2, MoreVertical, ArrowUp, ArrowDown, Search, ImageOff, Trash } from 'lucide-react';
import { AdminTable, type Column } from './AdminTable';
import { ConfirmModal } from './ConfirmModal';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Pagination } from './ui/pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';

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
  content?: string;
  coverImage?: string;
}

const FILTERS = [
  { value: 'all', label: 'All Articles' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked', label: 'Most Liked' },
];

export default function ArticlesTable() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const pageSize = 15;

  const fetchArticles = useCallback(async (p: number, opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), filter });
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load articles');
      const data = await res.json();

      setArticles(data.articles);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load articles');
    } finally {
      if (!opts.silent) setLoading(false);
    }
  }, [searchQuery, filter]);

  useEffect(() => {
    fetchArticles(page);
  }, [page, fetchArticles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete article');

      toast.success(`"${deleteTarget.title}" deleted`);
      fetchArticles(page, { silent: true });
    } catch {
      toast.error('Failed to delete article');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const res = await fetch('/api/admin/articles', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete all articles');

      toast.success('All articles deleted');
      setPage(1);
      fetchArticles(1, { silent: true });
    } catch {
      toast.error('Failed to delete all articles');
    } finally {
      setDeleteAllOpen(false);
    }
  };

  const handleReorder = async (article: Article, direction: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error('Failed to reorder article');
      await fetchArticles(page, { silent: true });
    } catch {
      toast.error('Failed to reorder article');
    }
  };

  const canReorder = filter === 'all' && !searchQuery;

  const columns: Column<Article>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (a) => (
        <div>
          <p className="font-medium text-sm text-base-content line-clamp-1 max-w-xs">{a.title}</p>
          <p className="text-xs text-base-content/60 mt-0.5">{a.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (a) => <Badge variant="outline">{a.category}</Badge>,
    },
    {
      key: 'views',
      header: 'Views',
      className: 'text-center',
      render: (a) => <span className="text-sm font-mono">{a.views.toLocaleString()}</span>,
    },
    {
      key: 'likes',
      header: 'Likes',
      className: 'text-center',
      render: (a) => <span className="text-sm font-mono">{a.likes.toLocaleString()}</span>,
    },
    {
      key: 'comments',
      header: 'Comments',
      className: 'text-center',
      render: (a) => <span className="text-sm font-mono">{a.commentsCount.toLocaleString()}</span>,
    },
    {
      key: 'published',
      header: 'Status',
      render: (a) => <Badge variant={a.published ? 'success' : 'warning'}>{a.published ? 'Published' : 'Draft'}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (a, index) => (
        <div className="flex items-center gap-1 flex-wrap justify-end" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="xs" asChild>
            <a href={`/admin/articles/${a.id}`}>
              <Eye /> View
            </a>
          </Button>
          <Button variant="ghost" size="xs" asChild>
            <a href={`/admin/articles/${a.id}/edit`}>
              <Pencil /> Edit
            </a>
          </Button>
          <Button variant="ghost" size="xs" className="text-error" onClick={() => setDeleteTarget(a)}>
            <Trash2 /> Delete
          </Button>
          {canReorder && (
            <div className="flex flex-col gap-0.5 ml-1">
              <button
                onClick={() => handleReorder(a, 'up')}
                disabled={index === 0}
                className="text-base-content/60 hover:text-base-content disabled:opacity-30 disabled:pointer-events-none"
                title="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleReorder(a, 'down')}
                disabled={index === articles.length - 1}
                className="text-base-content/60 hover:text-base-content disabled:opacity-30 disabled:pointer-events-none"
                title="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center w-full">
        <div className="relative w-full sm:max-w-md">
          <Input
            type="text"
            placeholder="Search by headline or content..."
            className="pr-9"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
          <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60" />
        </div>

        <Select
          value={filter}
          onValueChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          className="text-error hover:text-error w-full sm:w-auto sm:ml-auto"
          disabled={total === 0}
          onClick={() => setDeleteAllOpen(true)}
        >
          <Trash /> Delete All
        </Button>
      </div>

      <AdminTable
        columns={columns}
        data={articles}
        loading={loading}
        emptyMessage="No articles found."
        onRowClick={(a) => {
          window.location.href = `/admin/articles/${a.id}/edit`;
        }}
        renderMobileCard={(a, index) => {
          const dateStr = new Date(a.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const viewsStr = a.views >= 1000 ? (a.views / 1000).toFixed(1) + 'K' : a.views;

          return (
            <div
              className="flex gap-4 py-4 border-b border-base-300 last:border-0 relative bg-base-100 rounded-none sm:rounded-xl sm:border sm:border-base-300 sm:p-4 sm:mb-4 sm:last:mb-0 cursor-pointer"
              onClick={() => {
                window.location.href = `/admin/articles/${a.id}/edit`;
              }}
            >
              {/* Cover Image */}
              <div className="w-28 sm:w-40 h-20 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-base-200 relative">
                {a.coverImage ? (
                  <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-base-content/60/40">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 justify-center min-w-0 pr-6 sm:pr-0">
                <h3 className="font-bold text-base sm:text-xl line-clamp-2 leading-tight mb-2 text-base-content">
                  {a.title}
                </h3>
                <p className="text-xs sm:text-sm text-base-content/60 font-medium mb-2">
                  {dateStr} • {viewsStr} Views
                </p>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  {a.category}
                </span>
              </div>

              {/* Actions Dropdown */}
              <div className="absolute top-2 right-0 sm:top-4 sm:right-4" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="text-base-content/60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a href={`/admin/articles/${a.id}`}>
                        <Eye /> View
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={`/admin/articles/${a.id}/edit`}>
                        <Pencil /> Edit
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive onClick={() => setDeleteTarget(a)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                    {canReorder && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={index === 0} onClick={() => handleReorder(a, 'up')}>
                          <ArrowUp /> Move Up
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={index === articles.length - 1}
                          onClick={() => handleReorder(a, 'down')}
                        >
                          <ArrowDown /> Move Down
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        }}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={deleteAllOpen}
        message={`Are you sure you want to permanently delete all ${total} article${total === 1 ? '' : 's'}? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteAllOpen(false)}
      />
    </>
  );
}
