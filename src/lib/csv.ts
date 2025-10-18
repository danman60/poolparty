export function toCsv(headers: string[], rows: Array<Array<string | number | bigint | null | undefined>>): string {
  const esc = (v: any) => {
    if (v == null) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const out: string[] = [];
  out.push(headers.map(esc).join(','));
  for (const r of rows) out.push(r.map(esc).join(','));
  return out.join('\n');
}

export function downloadCsv(filename: string, csv: string) {
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  } catch {}
}

