import { describe, it, expect } from 'vitest'
import { toCsv } from './csv'

describe('csv utils', () => {
  it('toCsv escapes quotes and commas', () => {
    const headers = ['a', 'b']
    const rows = [["x, y", 'he said "hi"']]
    const csv = toCsv(headers, rows)
    expect(csv).toBe('a,b\n"x, y","he said ""hi"""')
  })
  it('toCsv handles empty and nulls', () => {
    const csv = toCsv(['a','b','c'], [[1, null, undefined], ["", 'ok', 3]])
    expect(csv.split('\n').length).toBe(3)
  })
})

