# Cloudflare Rate Limiting - Quick Reference

## Current Configuration
- **Rule Name**: Auth Protection
- **Pattern**: `/api/auth` (starts with)
- **Limit**: 5 requests per minute per IP
- **Action**: Block for 10 minutes
- **Status**: Active ✅

## What This Protects
- `/api/auth/login` - User login attempts
- `/api/auth/register` - New user registration
- `/api/auth/me` - User profile requests

## Expected Behavior
- **Normal users**: Can login/register without issues
- **Attackers**: Blocked after 5 attempts in 1 minute
- **Block duration**: 10 minutes before they can try again

## Monitoring
- Check **Analytics** → **Security** for blocked requests
- Look for 429 status codes in rate limiting analytics

## Future Updates
When voting goes live, consider switching to:
- **Pattern**: `/api/matchups/*/vote`
- **Limit**: 10 requests per minute per IP

## Emergency Disable
If legitimate users are being blocked:
1. Go to Security → Rate Limiting
2. Find "Auth Protection" rule
3. Toggle OFF temporarily
4. Adjust limits and re-enable
