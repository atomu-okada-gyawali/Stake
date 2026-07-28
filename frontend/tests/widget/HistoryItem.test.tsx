import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HistoryItem from '@/components/HistoryItem';

describe('HistoryItem', () => {
  it('shows the failure badge and report button only for FAILED items', () => {
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

    expect(screen.getByText('REPUTATION DROP')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /submit failure report/i }));
    expect(onFailureReport).toHaveBeenCalledTimes(1);

    rerender(
      <HistoryItem
        title="Morning run"
        date="13 JUL"
        description="Proof verified by squad"
        status="VERIFIED"
      />
    );

    expect(screen.getByText('VERIFIED')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
