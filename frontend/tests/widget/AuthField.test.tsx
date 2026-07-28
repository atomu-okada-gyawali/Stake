import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import AuthField from '@/components/auth/AuthField';

describe('AuthField', () => {
  it('renders the label, optional prefix, and passes input props through', () => {
    render(
      <AuthField label="Email" prefix="@" placeholder="you@example.com" type="email" />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('@')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('you@example.com');
    expect(input).toHaveAttribute('type', 'email');
  });
});
