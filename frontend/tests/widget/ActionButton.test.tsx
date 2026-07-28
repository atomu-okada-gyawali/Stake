import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Button from '@/components/ActionButton';

describe('ActionButton', () => {
  it('renders its children and fires onClick with the variant class applied', () => {
    const onClick = vi.fn();
    render(
      <Button variant="danger-link" onClick={onClick}>
        Log Out
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Log Out' });
    expect(button).toHaveClass('text-stake-dangerText');

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
