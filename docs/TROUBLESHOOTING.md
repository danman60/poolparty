# PoolParty Troubleshooting Guide

## Deployment Issues

### Build Error: "Module not found: Can't resolve '@/lib/supabase/server'"

**Cause**: `.vercelignore` excluding required source files

**Solution**:
```bash
# Edit .vercelignore - use root-only patterns
/supabase/   # NOT supabase/
```

**Prevention**: Always use leading slash for root-only exclusions

---

### Build Error: "server-only module not found"

**Cause**: Missing `server-only` package dependency

**Solution**:
```bash
npm install server-only
git add package.json package-lock.json
git commit -m "fix: add server-only dependency"
git push
```

---

### Vercel Cron Error: "Hobby accounts limited to daily crons"

**Cause**: Hourly cron not supported on Hobby tier

**Solution**:
```json
// vercel.json - change to daily
{
  "crons": [{
    "path": "/api/ingest/uniswap",
    "schedule": "0 0 * * *"  // Daily at midnight
  }]
}
```

---

## Runtime Issues

### RPC Rate Limiting

**Symptom**: "429 Too Many Requests" from RPC endpoint

**Solutions**:
1. Use custom RPC (Alchemy/Infura):
   ```
   NEXT_PUBLIC_RPC_MAINNET=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
   ```
2. Add retry logic with exponential backoff
3. Cache RPC responses

---

### Stale Subgraph Data

**Symptom**: Pool data is hours old

**Check**:
```bash
curl https://poolparty.vercel.app/api/health/subgraph
```

**Solutions**:
1. Wait for subgraph to sync
2. Check The Graph status page
3. Switch to alternative subgraph endpoint
4. Increase data freshness tolerance

---

### Wallet Won't Connect

**Symptoms**:
- MetaMask popup doesn't appear
- "No injected provider" error
- Connection immediately disconnects

**Solutions**:
1. Ensure MetaMask is installed and unlocked
2. Refresh page
3. Clear browser cache
4. Try incognito mode
5. Check browser console for errors
6. Update MetaMask extension

---

### Transaction Failures

#### "Insufficient funds for gas"
- **Cause**: Not enough ETH for gas
- **Solution**: Add ETH to wallet

#### "User rejected transaction"
- **Cause**: User cancelled in MetaMask
- **Solution**: Retry operation

#### "Slippage tolerance exceeded"
- **Cause**: Price moved during transaction
- **Solution**: Increase slippage tolerance or retry

#### "Invalid tick spacing"
- **Cause**: Tick range doesn't match fee tier
- **Solution**: Adjust ticks to valid spacing (e.g., 10 for 0.05% fee)

---

## Data Issues

### Empty Pool List

**Check**:
1. Visit `/api/health/data` - check `pools_count`
2. Check Supabase connection
3. Verify ingestion ran

**Fix**:
```bash
# Manually trigger ingestion
curl -H "Authorization: Bearer YOUR_SECRET" \
  https://poolparty.vercel.app/api/ingest/uniswap
```

---

### Incorrect APR Calculations

**Causes**:
- Volume spike/drop
- TVL changes
- Fee tier mismatch

**Validation**:
Compare with Uniswap.info or Revert Finance

---

## Performance Issues

### Slow Page Load

**Check**:
1. Network tab in DevTools
2. Lighthouse performance score
3. API response times

**Solutions**:
- Enable caching headers
- Optimize images
- Code split large components
- Add loading states

---

### High Database Query Time

**Solutions**:
1. Add indexes to frequently queried columns
2. Use connection pooling (Supabase Pooler)
3. Materialize complex views
4. Cache query results

---

## Development Issues

### Local Build Fails

**Common Causes**:
1. Missing environment variables
   - **Fix**: Copy `.env.local.example` to `.env.local`
2. Node modules out of sync
   - **Fix**: `rm -rf node_modules && npm install`
3. TypeScript errors
   - **Fix**: `npm run lint`

---

### Cannot Test Wallet Locally

**Issue**: Localhost not whitelisted in WalletConnect

**Solution**:
1. Use ngrok for HTTPS tunnel:
   ```bash
   ngrok http 3000
   ```
2. Or test directly on Vercel preview deployments

---

## Monitoring & Debugging

### Enable Debug Logging

```typescript
// next.config.ts
export default {
  logging: {
    fetches: {
      fullUrl: true
    }
  }
};
```

### Check Vercel Logs

```bash
vercel logs
```

### Check Supabase Logs

Visit Supabase Dashboard → Logs Explorer

---

## Getting Help

1. **Check Documentation**: Start with ARCHITECTURE.md, API.md
2. **Search Issues**: GitHub Issues for similar problems
3. **Health Checks**: Visit `/status` page
4. **Create Issue**: Provide logs, error messages, steps to reproduce
5. **Community**: Discord/Telegram (if available)

---

## Emergency Procedures

### Rollback Deployment

1. Go to Vercel Dashboard
2. Select previous working deployment
3. Click "Promote to Production"

### Pause Cron Jobs

Edit `vercel.json`:
```json
{
  "crons": []  // Empty array disables all crons
}
```

### Database Rollback

Supabase: Settings → Backups → Restore

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `ECONNREFUSED` | Can't reach service | Check network, service status |
| `ETIMEDOUT` | Request timeout | Increase timeout, check RPC |
| `ENOTFOUND` | DNS resolution failed | Check domain, DNS propagation |
| `4001` | User rejected transaction | User action required |
| `429` | Rate limited | Reduce request frequency |
| `500` | Server error | Check logs, retry |
