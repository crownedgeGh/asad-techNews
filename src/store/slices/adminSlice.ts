import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface CachedArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  trending: boolean;
  featured: boolean;
  homepage: boolean;
  views: number;
  likes: number;
  commentsCount: number;
  sortOrder: number;
  createdAt: string;
  content?: string;
  coverImage?: string;
  credit?: string;
}

export interface ArticleListCacheEntry {
  articles: CachedArticle[];
  total: number;
  fetchedAt: number;
}

export interface ArticleDetailCacheEntry {
  article: {
    id: number;
    title: string;
    slug: string;
    content: string;
    category: string;
    coverImage: string;
    published: boolean;
    trending: boolean;
    featured: boolean;
    homepage: boolean;
    credit?: string;
  };
  fetchedAt: number;
}

export interface ArticlesFilters {
  page: number;
  filter: string;
  searchQuery: string;
  category: string;
}

interface AdminState {
  articlesFilters: ArticlesFilters;
  articlesListCache: Record<string, ArticleListCacheEntry>;
  articleDetailCache: Record<number, ArticleDetailCacheEntry>;
}

const initialState: AdminState = {
  articlesFilters: { page: 1, filter: 'all', searchQuery: '', category: 'all' },
  articlesListCache: {},
  articleDetailCache: {},
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setArticlesFilters(state, action: PayloadAction<Partial<ArticlesFilters>>) {
      state.articlesFilters = { ...state.articlesFilters, ...action.payload };
    },
    setArticlesListCache(state, action: PayloadAction<{ key: string; entry: ArticleListCacheEntry }>) {
      state.articlesListCache[action.payload.key] = action.payload.entry;
    },
    clearArticlesListCache(state) {
      state.articlesListCache = {};
    },
    setArticleDetailCache(state, action: PayloadAction<{ id: number; entry: ArticleDetailCacheEntry }>) {
      state.articleDetailCache[action.payload.id] = action.payload.entry;
    },
    clearArticleDetailCache(state, action: PayloadAction<number | undefined>) {
      if (action.payload === undefined) {
        state.articleDetailCache = {};
      } else {
        delete state.articleDetailCache[action.payload];
      }
    },
  },
});

export const {
  setArticlesFilters,
  setArticlesListCache,
  clearArticlesListCache,
  setArticleDetailCache,
  clearArticleDetailCache,
} = adminSlice.actions;

export default adminSlice.reducer;
