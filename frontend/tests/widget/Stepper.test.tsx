import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Stepper from '@/components/Stepper';

describe('Stepper', () => {
  it('highlights completed and active steps and mutes upcoming ones', () => {
    render(<Stepper currentStep={3} />);

    // Steps 1-2 are completed, 3 is active — all highlighted with the accent color
    expect(screen.getByText('Identify')).toHaveClass('text-stake-accent');
    expect(screen.getByText('Duration')).toHaveClass('text-stake-accent');
    expect(screen.getByText('Frequency')).toHaveClass('text-stake-accent');

    // Step 4 has not been reached yet
    expect(screen.getByText('Verifier')).toHaveClass('text-stake-muted');
  });
});
