import { fetchTopPools } from './uniswap'

describe('fetchTopPools', () => {
  it('parses subgraph response', async () => {
    const body = {
      data: {
        pools: [
          {
            id: '0xpool',
            feeTier: '3000',
            totalValueLockedUSD: '123.45',
            volumeUSD: '999.9',
            token0: { id: '0x0', symbol: 'AAA', name: 'AAA', decimals: '18' },
            token1: { id: '0x1', symbol: 'BBB', name: 'BBB', decimals: '18' },
          },
        ],
      },
    }
    const mock = vi.spyOn(global, 'fetch' as any).mockResolvedValue({ ok: true, json: async () => body } as any)
    const res = await fetchTopPools(1)
    expect(res).toHaveLength(1)
    expect(res[0].id).toBe('0xpool')
    mock.mockRestore()
  })
})

