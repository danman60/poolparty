import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PoolsTable from './PoolsTable'

describe('PoolsTable', () => {
  it('renders loading then no data without supabase', async () => {
    const mock = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as any)
    const qc = new QueryClient()
    render(
      <QueryClientProvider client={qc}>
        <PoolsTable />
      </QueryClientProvider>
    )
    expect(screen.getByText(/Loading pools/i)).toBeInTheDocument()
    await waitFor(() => expect(mock).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText(/No data yet/i)).toBeInTheDocument())
    mock.mockRestore()
  })
})
