import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageList(page: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const window = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - window && i <= page + window)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }
  return pages;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = getPageList(page, totalPages);

  return (
    <nav className="join" aria-label="Pagination">
      <button
        className="join-item btn btn-outline btn-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-3.5" />
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <button key={`e-${i}`} className="join-item btn btn-outline btn-sm btn-disabled">
            …
          </button>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn('join-item btn btn-sm', p === page ? 'btn-primary' : 'btn-outline')}
          >
            {p}
          </button>
        )
      )}
      <button
        className="join-item btn btn-outline btn-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}
