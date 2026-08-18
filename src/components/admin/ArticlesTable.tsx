import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Eye, Trash2, MoreVertical, ListOrdered, Search, ImageOff, Trash, RefreshCw, RotateCcw } from 'lucide-react';
import { AdminTable, type Column } from './AdminTable';
import { ConfirmModal } from './ConfirmModal';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Pagination } from './ui/pagination';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem } from './ui/dropdown-menu';
import { AdminStoreProvider } from '../../store/AdminStoreProvider';
import { useAppDispatch, useAppSelector } from '../../store';
import { setArticlesFilters, setArticlesListCache, clearArticlesListCache, type CachedArticle } from '../../store/slices/adminSlice';
import { formatDateTime } from '../../lib/format';
import { CATEGORIES } from '../../lib/categories';

type Article = CachedArticle;

const FILTERS = [
  { value: 'all', label: 'All Articles' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked', label: 'Most Liked' },
];

const CATEGORY_FILTERS = [{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))];

// Cached list results are shown instantly; entries older than this are refreshed silently in the background.
const FRESH_MS = 30_000;

function cacheKey(page: number, filter: string, searchQuery: string, category: string) {
  return `${filter}|${page}|${searchQuery.trim()}|${category}`;
}

const MAX_POSITION = 15;

function PositionSelect({
  article,
  onChange,
}: {
  article: Article;
  onChange: (position: number) => void;
}) {
  return (
    <Select
      value={String(article.sortOrder)}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger className="h-8 w-20 shrink-0 gap-1 px-2 text-xs" title="Set trend position">
        <ListOrdered className="h-3 w-3 shrink-0 opacity-60" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0">Auto</SelectItem>
        {Array.from({ length: MAX_POSITION }, (_, i) => i + 1).map((p) => (
          <SelectItem key={p} value={String(p)}>
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ArticlesTableInner() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.admin.articlesFilters);
  const listCache = useAppSelector((s) => s.admin.articlesListCache);
  const { page, filter, searchQuery, category } = filters;

  const key = cacheKey(page, filter, searchQuery, category);
  const cached = listCache[key];

  const [articles, setArticles] = useState<Article[]>(cached?.articles ?? []);
  const [total, setTotal] = useState(cached?.total ?? 0);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [resetPositionsOpen, setResetPositionsOpen] = useState(false);
  const pageSize = 15;

  const setPage = (v: number) => dispatch(setArticlesFilters({ page: v }));

  const fetchArticles = useCallback(async (p: number, f: string, q: string, c: string, opts: { silent?: boolean } = {}) => {
    if (opts.silent) setRefreshing(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), filter: f });
      if (q.trim()) params.set('search', q.trim());
      if (c && c !== 'all') params.set('category', c);

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load articles');
      const data = await res.json();

      setArticles(data.articles);
      setTotal(data.total);
      dispatch(setArticlesListCache({
        key: cacheKey(p, f, q, c),
        entry: { articles: data.articles, total: data.total, fetchedAt: Date.now() },
      }));
    } catch {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    const entry = listCache[key];
    if (entry) {
      // Cache hit: render instantly, no blocking spinner. Revalidate quietly if it's gone a bit stale.
      setArticles(entry.articles);
      setTotal(entry.total);
      setLoading(false);
      if (Date.now() - entry.fetchedAt > FRESH_MS) {
        fetchArticles(page, filter, searchQuery, category, { silent: true });
      }
    } else {
      fetchArticles(page, filter, searchQuery, category);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      dispatch(clearArticlesListCache());
      fetchArticles(page, filter, searchQuery, category, { silent: true });
    };
    window.addEventListener('admin:refresh', handler);
    return () => window.removeEventListener('admin:refresh', handler);
  }, [dispatch, fetchArticles, page, filter, searchQuery, category]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete article');

      toast.success(`"${deleteTarget.title}" deleted`);
      dispatch(clearArticlesListCache());
      fetchArticles(page, filter, searchQuery, category, { silent: true });
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
      dispatch(clearArticlesListCache());
      setPage(1);
      fetchArticles(1, filter, searchQuery, category, { silent: true });
    } catch {
      toast.error('Failed to delete all articles');
    } finally {
      setDeleteAllOpen(false);
    }
  };

  const handleResetPositions = async () => {
    try {
      const res = await fetch('/api/admin/articles/reset-positions', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset positions');

      toast.success('All articles reset to date/time order');
      dispatch(clearArticlesListCache());
      await fetchArticles(page, filter, searchQuery, category, { silent: true });
    } catch {
      toast.error('Failed to reset positions');
    } finally {
      setResetPositionsOpen(false);
    }
  };

  const handleReorder = async (article: Article, position: number) => {
    try {
      const res = await fetch(`/api/admin/articles/${article.id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position }),
      });
      if (!res.ok) throw new Error('Failed to reorder article');
      toast.success(position === 0 ? 'Article set to auto (date) order' : `Article moved to position ${position}`);
      dispatch(clearArticlesListCache());
      await fetchArticles(page, filter, searchQuery, category, { silent: true });
    } catch {
      toast.error('Failed to reorder article');
    }
  };

  const handleToggleTrending = async (article: Article, isTrending: boolean) => {
    // Optimistic UI update
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, trending: isTrending } : a))
    );

    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trending: isTrending }),
      });

      if (!res.ok) throw new Error('Failed to update trending status');
      toast.success(isTrending ? 'Article added to trending' : 'Article removed from trending');
      dispatch(clearArticlesListCache());
    } catch {
      toast.error('Failed to update trending status');
      // Rollback on failure
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, trending: !isTrending } : a))
      );
    }
  };

  const handleToggleFeatured = async (article: Article, isFeatured: boolean) => {
    // Optimistic UI update
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, featured: isFeatured } : a))
    );

    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: isFeatured }),
      });

      if (!res.ok) throw new Error('Failed to update featured status');
      toast.success(isFeatured ? 'Article added to featured' : 'Article removed from featured');
      dispatch(clearArticlesListCache());
    } catch {
      toast.error('Failed to update featured status');
      // Rollback on failure
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, featured: !isFeatured } : a))
      );
    }
  };

  const handleTogglePublished = async (article: Article, isPublished: boolean) => {
    // Optimistic UI update
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, published: isPublished } : a))
    );

    try {
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: isPublished }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      toast.success(isPublished ? 'Article published' : 'Article moved to draft');
      dispatch(clearArticlesListCache());
    } catch {
      toast.error('Failed to update status');
      // Rollback on failure
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, published: !isPublished } : a))
      );
    }
  };

  const canReorder = filter === 'all' && !searchQuery && category === 'all';

  const columns: Column<Article>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="w-16 h-11 shrink-0 rounded-md overflow-hidden bg-base-200">
            {a.coverImage ? (
              <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/40">
                <ImageOff className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm text-base-content line-clamp-1 max-w-xs">{a.title}</p>
              {a.trending && (
                <span className="badge badge-warning badge-xs shrink-0 font-bold text-[10px] uppercase">Trending</span>
              )}
              {a.featured && (
                <span className="badge badge-info badge-xs shrink-0 font-bold text-[10px] uppercase">Featured</span>
              )}
            </div>
            <p className="text-xs text-base-content/60 mt-0.5 line-clamp-1 max-w-xs">
              {formatDateTime(a.createdAt)}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      className: 'whitespace-nowrap',
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
      render: (a) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Switch
            className="toggle-sm"
            checked={a.published}
            onCheckedChange={(checked) => handleTogglePublished(a, checked)}
          />
          <Badge variant={a.published ? 'success' : 'warning'}>{a.published ? 'Published' : 'Draft'}</Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <div className="flex items-center gap-1 flex-wrap justify-end" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-1 mr-2 bg-base-200/50 px-2 py-1 rounded-md border border-base-300/40">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase">Trending</span>
              <Switch
                className="toggle-sm"
                checked={a.trending}
                onCheckedChange={(checked) => handleToggleTrending(a, checked)}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-base-content/60 uppercase">Featured</span>
              <Switch
                className="toggle-sm"
                checked={a.featured}
                onCheckedChange={(checked) => handleToggleFeatured(a, checked)}
              />
            </div>
          </div>
          <Button variant="ghost" size="xs" asChild>
            <a href={`/admin/articles/${a.id}`}>
              <Eye /> View
            </a>
          </Button>
          <Button variant="ghost" size="xs" className="text-error" onClick={() => setDeleteTarget(a)}>
            <Trash2 /> Delete
          </Button>
          {canReorder && (
            <PositionSelect article={a} onChange={(position) => handleReorder(a, position)} />
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
              dispatch(setArticlesFilters({ searchQuery: e.target.value, page: 1 }));
            }}
          />
          <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/60" />
        </div>

        <Select
          value={filter}
          onValueChange={(v) => {
            dispatch(setArticlesFilters({ filter: v, page: 1 }));
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

        <Select
          value={category}
          onValueChange={(v) => {
            dispatch(setArticlesFilters({ category: v, page: 1 }));
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTERS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {refreshing && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-base-content/60 shrink-0">
            <RefreshCw className="h-3 w-3 animate-spin" /> Refreshing…
          </span>
        )}

        {canReorder && (
          <Button
            variant="outline"
            className="w-full sm:w-auto sm:ml-auto"
            disabled={total === 0}
            onClick={() => setResetPositionsOpen(true)}
          >
            <RotateCcw /> Reset Position
          </Button>
        )}

        <Button
          variant="outline"
          className={`text-error hover:text-error w-full sm:w-auto ${canReorder ? '' : 'sm:ml-auto'}`}
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
        renderMobileCard={(a) => {
          const dateStr = formatDateTime(a.createdAt);
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
              <div className="flex flex-col flex-1 justify-center min-w-0 pr-9 sm:pr-10">
                <div className="flex items-start gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-base sm:text-xl line-clamp-2 leading-tight text-base-content">
                    {a.title}
                  </h3>
                  {a.trending && (
                    <span className="badge badge-warning badge-xs shrink-0 font-bold text-[10px] uppercase mt-1">Trending</span>
                  )}
                  {a.featured && (
                    <span className="badge badge-info badge-xs shrink-0 font-bold text-[10px] uppercase mt-1">Featured</span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-base-content/60 font-medium mb-2">
                  {dateStr} • {viewsStr} Views
                </p>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  {a.category}
                </span>
              </div>

              {/* Actions Dropdown */}
              <div className="absolute top-2 right-1 sm:top-4 sm:right-4" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Article actions">
                      <MoreVertical className="text-base-content/60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={canReorder ? 'max-h-72 overflow-y-auto' : undefined}>
                    <DropdownMenuItem asChild>
                      <a href={`/admin/articles/${a.id}`}>
                        <Eye /> View
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleTrending(a, !a.trending)}>
                      <span>{a.trending ? '⭐ Remove Trending' : '⭐ Make Trending'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleFeatured(a, !a.featured)}>
                      <span>{a.featured ? '★ Remove Featured' : '★ Make Featured'}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem destructive onClick={() => setDeleteTarget(a)}>
                      <Trash2 /> Delete
                    </DropdownMenuItem>
                    {canReorder && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={a.sortOrder === 0}
                          onSelect={() => handleReorder(a, 0)}
                        >
                          <ListOrdered className="h-3.5 w-3.5" /> Auto (by date)
                        </DropdownMenuCheckboxItem>
                        {Array.from({ length: MAX_POSITION }, (_, i) => i + 1).map((p) => (
                          <DropdownMenuCheckboxItem
                            key={p}
                            checked={a.sortOrder === p}
                            onSelect={() => handleReorder(a, p)}
                          >
                            {p}
                          </DropdownMenuCheckboxItem>
                        ))}
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

      <ConfirmModal
        open={resetPositionsOpen}
        message="Reset all articles to automatic date/time order? Any manually pinned trend positions will be cleared."
        confirmLabel="Reset Position"
        onConfirm={handleResetPositions}
        onCancel={() => setResetPositionsOpen(false)}
      />
    </>
  );
}

export default function ArticlesTable() {
  return (
    <AdminStoreProvider>
      <ArticlesTableInner />
    </AdminStoreProvider>
  );
}
