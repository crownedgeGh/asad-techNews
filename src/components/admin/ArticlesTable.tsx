import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, Pencil, Trash2, RotateCcw, MoreVertical, ArrowUp, ArrowDown, Search, ImageOff } from 'lucide-react';
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
  isRemoved?: boolean;
}

const FILTERS = [
  { value: 'all', label: 'All Articles' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'removed', label: 'Removed (Trash)' },
  { value: 'most_viewed', label: 'Most Viewed' },
  { value: 'most_liked', label: 'Most Liked' },
];

export default function ArticlesTable() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const pageSize = 15;

  const fetchArticles = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('admin_articles');
      let allArticles: Article[] = stored ? JSON.parse(stored) : [];

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        allArticles = allArticles.filter(
          (a) => a.title.toLowerCase().includes(query) || (a.content && a.content.toLowerCase().includes(query))
        );
      }

      if (filter === 'removed') {
        allArticles = allArticles.filter((a) => a.isRemoved);
      } else {
        allArticles = allArticles.filter((a) => !a.isRemoved);
        if (filter === 'published') {
          allArticles = allArticles.filter((a) => a.published);
        } else if (filter === 'draft') {
          allArticles = allArticles.filter((a) => !a.published);
        }
      }

      if (filter === 'most_viewed') {
        allArticles.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (filter === 'most_liked') {
        allArticles.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else {
        allArticles.sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id));
      }

      const start = (p - 1) * pageSize;
      const paginated = allArticles.slice(start, start + pageSize);

      setArticles(paginated);
      setTotal(allArticles.length);
    } catch {
      toast.error('Failed to load articles from local storage');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter]);

  useEffect(() => {
    fetchArticles(page);
  }, [page, fetchArticles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const stored = localStorage.getItem('admin_articles');
      let allArticles: Article[] = stored ? JSON.parse(stored) : [];

      if (filter === 'removed') {
        allArticles = allArticles.filter((a) => a.id !== deleteTarget.id);
      } else {
        const index = allArticles.findIndex((a) => a.id === deleteTarget.id);
        if (index !== -1) {
          allArticles[index].isRemoved = true;
        }
      }

      localStorage.setItem('admin_articles', JSON.stringify(allArticles));

      if (filter === 'removed') {
        setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        setTotal((t) => t - 1);
      } else {
        fetchArticles(page);
      }
      toast.success(filter === 'removed' ? `"${deleteTarget.title}" permanently deleted` : `"${deleteTarget.title}" removed`);
    } catch {
      toast.error('Failed to delete article');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleRestore = async (article: Article) => {
    try {
      const stored = localStorage.getItem('admin_articles');
      let allArticles: Article[] = stored ? JSON.parse(stored) : [];

      const index = allArticles.findIndex((a) => a.id === article.id);
      if (index !== -1) {
        allArticles[index].isRemoved = false;
        localStorage.setItem('admin_articles', JSON.stringify(allArticles));
        fetchArticles(page);
        toast.success(`"${article.title}" restored`);
      }
    } catch {
      toast.error('Failed to restore article');
    }
  };

  const handleReorder = async (article: Article, direction: 'up' | 'down') => {
    try {
      const stored = localStorage.getItem('admin_articles');
      let allArticles: Article[] = stored ? JSON.parse(stored) : [];

      const index = allArticles.findIndex((a) => a.id === article.id);
      if (index === -1) return;

      if (direction === 'up' && index > 0) {
        const temp = allArticles[index].sortOrder;
        allArticles[index].sortOrder = allArticles[index - 1].sortOrder;
        allArticles[index - 1].sortOrder = temp;
      } else if (direction === 'down' && index < allArticles.length - 1) {
        const temp = allArticles[index].sortOrder;
        allArticles[index].sortOrder = allArticles[index + 1].sortOrder;
        allArticles[index + 1].sortOrder = temp;
      }

      localStorage.setItem('admin_articles', JSON.stringify(allArticles));
      await fetchArticles(page);
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
          <p className="font-medium text-sm text-foreground line-clamp-1 max-w-xs">{a.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{a.slug}</p>
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
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {a.isRemoved ? (
            <>
              <Button variant="ghost" size="xs" className="text-success" onClick={() => handleRestore(a)}>
                <RotateCcw /> Restore
              </Button>
              <Button variant="ghost" size="xs" className="text-destructive" onClick={() => setDeleteTarget(a)}>
                <Trash2 /> Delete
              </Button>
            </>
          ) : (
            <>
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
              <Button variant="ghost" size="xs" className="text-destructive" onClick={() => setDeleteTarget(a)}>
                <Trash2 /> Remove
              </Button>
              {canReorder && (
                <div className="flex flex-col gap-0.5 ml-1">
                  <button
                    onClick={() => handleReorder(a, 'up')}
                    disabled={index === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(a, 'down')}
                    disabled={index === articles.length - 1}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </>
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
          <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
      </div>

      <AdminTable
        columns={columns}
        data={articles}
        loading={loading}
        emptyMessage="No articles found."
        renderMobileCard={(a, index) => {
          const dateStr = new Date(a.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const viewsStr = a.views >= 1000 ? (a.views / 1000).toFixed(1) + 'K' : a.views;

          return (
            <div className="flex gap-4 py-4 border-b border-border last:border-0 relative bg-card rounded-none sm:rounded-xl sm:border sm:border-border sm:p-4 sm:mb-4 sm:last:mb-0">
              {/* Cover Image */}
              <div className="w-28 sm:w-40 h-20 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-secondary relative">
                {a.coverImage ? (
                  <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                    <ImageOff className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 justify-center min-w-0 pr-6 sm:pr-0">
                <h3 className="font-bold text-base sm:text-xl line-clamp-2 leading-tight mb-2 text-foreground">
                  {a.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-2">
                  {dateStr} • {viewsStr} Views
                </p>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                  {a.category}
                </span>
              </div>

              {/* Actions Dropdown */}
              <div className="absolute top-2 right-0 sm:top-4 sm:right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreVertical className="text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {a.isRemoved ? (
                      <>
                        <DropdownMenuItem className="text-success" onClick={() => handleRestore(a)}>
                          <RotateCcw /> Restore
                        </DropdownMenuItem>
                        <DropdownMenuItem destructive onClick={() => setDeleteTarget(a)}>
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
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
                          <Trash2 /> Remove
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
        message={
          filter === 'removed'
            ? `Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`
            : `Are you sure you want to move "${deleteTarget?.title}" to the trash?`
        }
        confirmLabel={filter === 'removed' ? 'Permanently Delete' : 'Remove'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
