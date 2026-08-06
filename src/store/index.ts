import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import adminReducer from './slices/adminSlice';

const STORAGE_KEY = 'admin-redux-state:v1';

function loadPersistedState() {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    return { admin: JSON.parse(raw) };
  } catch {
    return undefined;
  }
}

export const store = configureStore({
  reducer: {
    admin: adminReducer,
  },
  preloadedState: loadPersistedState(),
});

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState().admin));
    } catch {
      // sessionStorage unavailable (private mode, quota, etc.) — cache just won't persist across navigations
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
