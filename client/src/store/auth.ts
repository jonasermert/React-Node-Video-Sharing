import { useSyncExternalStore } from 'react';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  ready: boolean;
}

interface ApiError extends Error {
  errors?: Record<string, string>;
}

let state: AuthState = { user: null, ready: false };
const listeners = new Set<() => void>();

function setState(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export async function request<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const r = await fetch(url, {
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const error: ApiError = Object.assign(new Error(data.message || 'Request failed'), {
      errors: data.errors || {},
    });
    throw error;
  }
  return data as T;
}

export const auth = {
  getState: getSnapshot,
  subscribe,
  request,
  async load() {
    try {
      const data = await request<{ user: User }>('/api/auth/me');
      setState({ user: data.user });
    } catch {
      setState({ user: null });
    } finally {
      setState({ ready: true });
    }
  },
  async login(payload: { email: string; password: string }) {
    const data = await request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setState({ user: data.user });
  },
  async register(payload: { name: string; email: string; password: string }) {
    const data = await request<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setState({ user: data.user });
  },
  async logout() {
    await request('/api/auth/logout', { method: 'POST' });
    setState({ user: null });
  },
};

export function useAuth() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
