import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PrimaryButton from '@/components/wizard/PrimaryButton';

describe('PrimaryButton', () => {
  it('does not fire onClick while disabled, then fires once enabled', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <PrimaryButton onClick={onClick} disabled>
        Continue
      </PrimaryButton>
    );

    const button = screen.getByRole('button', { name: /continue/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();

    rerender(<PrimaryButton onClick={onClick}>Continue</PrimaryButton>);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
