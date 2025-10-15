import { render, screen, waitFor } from '@testing-library/react'
import PoolsTable from './PoolsTable'

describe('PoolsTable', () => {
  it('renders loading then no data without supabase', async () => {
    const mock = vi.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as any)
    render(<PoolsTable />)
    expect(screen.getByText(/Loading pools/i)).toBeInTheDocument()
    await waitFor(() => expect(mock).toHaveBeenCalled())
    expect(screen.getByText(/No data yet/i)).toBeInTheDocument()
    mock.mockRestore()
  })
})

