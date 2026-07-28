import { describe, expect, it } from 'vitest';

import { clearAuth, getAuthToken, getUser, isAuthenticated, setAuth } from '@/lib/auth';

const user = { id: 1, name: 'Atomu', email: 'atomu@example.com' };

describe('lib/auth', () => {
  it('setAuth stores the token and serialized user in localStorage', () => {
    setAuth('token-123', user);

    expect(localStorage.getItem('authToken')).toBe('token-123');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
  });

  it('getAuthToken returns the stored token, or null when none is set', () => {
    expect(getAuthToken()).toBeNull();

    setAuth('token-456', user);
    expect(getAuthToken()).toBe('token-456');
  });

  it('getUser parses the stored user back into an object, or returns null', () => {
    expect(getUser()).toBeNull();

    setAuth('token-789', user);
    expect(getUser()).toEqual(user);
  });

  it('isAuthenticated reflects whether a token is present', () => {
    expect(isAuthenticated()).toBe(false);

    setAuth('token-abc', user);
    expect(isAuthenticated()).toBe(true);
  });

  it('clearAuth removes both the token and the user', () => {
    setAuth('token-def', user);
    clearAuth();

    expect(getAuthToken()).toBeNull();
    expect(getUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});
