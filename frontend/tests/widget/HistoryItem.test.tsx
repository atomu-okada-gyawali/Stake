import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HistoryItem from '@/components/HistoryItem';

describe('HistoryItem', () => {
  it('lets FAILED items submit a failure report and disables the button once handled', () => {
    const onFailureReport = vi.fn();
    const { rerender } = render(
      <HistoryItem
        title="Morning run"
        date="12 JUL"
        description="Missed the 6am check-in"
        status="FAILED"
        onFailureReport={onFailureReport}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /submit failure report/i }));
    expect(onFailureReport).toHaveBeenCalledTimes(1);

    rerender(
      <HistoryItem
        title="Morning run"
        date="12 JUL"
        description="Missed the 6am check-in"
        status="FAILED"
        onFailureReport={onFailureReport}
        reportedReason="Overslept"
      />
    );

    expect(screen.getByRole('button', { name: /report submitted/i })).toBeDisabled();
    expect(screen.getByText(/overslept/i)).toBeInTheDocument();

    rerender(
      <HistoryItem
        title="Morning run"
        date="13 JUL"
        description="Proof verified by squad"
        status="VERIFIED"
      />
    );

    expect(screen.getByRole('button', { name: /completed/i })).toBeDisabled();
  });
});
