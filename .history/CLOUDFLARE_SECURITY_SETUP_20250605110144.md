# Cloudflare Security Configuration Guide
## Free Plan Security Setup for MusikMadness

This guide covers all security settings you should configure on Cloudflare's free plan to maximize protection for your music tournament website.

## ✅ Already Configured
- Domain added to Cloudflare
- SSL/TLS set to Full (Strict) mode
- R2 bucket created for song streaming

## 🔒 Essential Security Settings to Configure

### 1. SSL/TLS Configuration
**Location: SSL/TLS tab**

#### Edge Certificates
- ✅ **Always Use HTTPS**: Enable (forces all HTTP traffic to HTTPS)
- ✅ **HTTP Strict Transport Security (HSTS)**: Enable with these settings:
  - Max Age Header: 6 months (15552000 seconds)
  - Include Subdomains: Enable
  - Preload: Enable (optional, but recommended)
- ✅ **Minimum TLS Version**: Set to 1.2 (blocks older, insecure versions)
- ✅ **TLS 1.3**: Enable (latest, most secure TLS version)

### 2. Security Settings
**Location: Security tab**

#### Security Level
- ✅ **Security Level**: **AUTOMATED** (Always Protected)
  - Cloudflare now uses AI-driven automatic security
  - Adapts in real-time to threat levels
  - No manual configuration needed - better than old static levels
  - Shows as "Always Protected" in dashboard

#### Bot Fight Mode
- ✅ **Bot Fight Mode**: Enable
  - Free alternative to Bot Management
  - Blocks common bots and scrapers

#### Browser Integrity Check
- ✅ **Browser Integrity Check**: Enable
  - Blocks known malicious browsers

### 3. Firewall Rules (Free Plan - 5 rules available)
**Location: Security > WAF**

Create these firewall rules in order of priority:

#### Rule 1: Block Common Attack Patterns
```
Field: URI Path
Operator: contains
Value: /wp-admin
Action: Block
```

#### Rule 2: Block Suspicious User Agents
```
Field: User Agent
Operator: contains
Value: sqlmap
Action: Block
```

#### Rule 3: Rate Limiting for API Endpoints
```
Field: URI Path
Operator: starts with
Value: /api/
Action: Challenge
```

#### Rule 4: Protect Admin Areas
```
Field: URI Path
Operator: contains
Value: /admin
Action: Challenge
```

#### Rule 5: Block Countries (if needed)
```
Field: Country
Operator: equals
Value: [Select high-risk countries if applicable]
Action: Block
```

### 4. Configuration Rules (Free Plan - 10 rules available)
**Location: Rules > Configuration Rules**

#### Rule 1: Main Site Security
```
Rule Name: Main Site Security
When incoming requests match: Custom filter expression
Field: URI Path | Operator: starts with | Value: /
Then the settings are:
- Security Level: High (if available)
- Browser Integrity Check: On
```

#### Rule 2: API Protection
```
Rule Name: API Protection
When incoming requests match: Custom filter expression  
Field: URI Path | Operator: starts with | Value: /api/
Then the settings are:
- Security Level: High
- Cache Level: Bypass
```

#### Rule 3: Admin Area Protection
```
Rule Name: Admin Protection
When incoming requests match: Custom filter expression
Field: URI Path | Operator: contains | Value: /admin
Then the settings are:
- Security Level: High
- Challenge: Always challenge
```

### 5. DNS Security
**Location: DNS tab**

#### DNS Records Security
- ✅ **Proxy Status**: Enable orange cloud (🧡) for:
  - A records pointing to your web server
  - CNAME records for subdomains
- ✅ **DNSSEC**: Enable (adds cryptographic signatures to DNS records)

### 6. Speed & Caching (Security Benefits)
**Location: Speed tab**

#### Auto Minify
- ✅ **Auto Minify**: Enable for JavaScript, CSS, HTML
  - Reduces attack surface by removing comments/whitespace

#### Brotli Compression
- ✅ **Brotli**: Enable
  - Faster loading = less time for attacks

### 7. Network Security
**Location: Network tab**

#### HTTP/2
- ✅ **HTTP/2**: Enable
  - More secure than HTTP/1.1

#### IPv6 Compatibility
- ✅ **IPv6**: Enable
  - Future-proofing and better routing

### 8. Scrape Shield
**Location: Scrape Shield tab**

#### Email Address Obfuscation
- ✅ **Email Address Obfuscation**: Enable
  - Hides email addresses from scrapers

#### Server-side Excludes
- ✅ **Server-side Excludes**: Enable
  - Hides sensitive content from bots

#### Hotlink Protection
- ✅ **Hotlink Protection**: Enable
  - Prevents other sites from stealing your bandwidth

## 🔧 Additional Security Recommendations

### 1. Configure Security Headers
Add these headers to your backend responses:

```typescript
// Add to your Express.js middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});
```

### 2. R2 Bucket Security
- Set proper CORS policies
- Use signed URLs for sensitive content
- Configure bucket policies to restrict access

### 3. Rate Limiting at Application Level
Implement rate limiting in your backend:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## 📊 Monitoring & Alerts

### Analytics & Security Events
**Location: Analytics > Security**
- Monitor blocked requests
- Review top attack vectors
- Check for unusual traffic patterns

### Security Events to Watch
- High number of blocked requests
- Unusual geographic traffic
- Spike in 4xx/5xx errors
- Bot traffic increases

## 🚨 Emergency Response

### If Under Attack
1. **Under Attack Mode**: Security > Settings > Security Level > "I'm Under Attack"
2. **Adjust Firewall Rules**: Block specific IPs/countries
3. **Enable Challenge Pages**: Force verification for all visitors

### Temporary Lockdown
- Set Security Level to "I'm Under Attack"
- Block all countries except your target audience
- Enable "Browser Integrity Check"

## 📝 Configuration Checklist

### SSL/TLS Settings
- [ ] Always Use HTTPS enabled
- [ ] HSTS configured with 6-month max-age
- [ ] Minimum TLS 1.2 set
- [ ] TLS 1.3 enabled

### Security Settings
- [ ] Security Level set to "Always Protected" (automated)
- [ ] Bot Fight Mode enabled
- [ ] Browser Integrity Check enabled

### Firewall & Rate Limiting
- [ ] 5 Firewall rules configured
- [ ] Rate limiting rule for /api/auth/* configured
- [ ] Configuration Rules for security headers set up

### Network & DNS
- [ ] DNSSEC enabled
- [ ] Orange cloud enabled for web traffic
- [ ] IPv6 compatibility enabled

### Scrape Shield
- [ ] Email obfuscation enabled
- [ ] Server-side excludes enabled
- [ ] Hotlink protection enabled

### Speed & Caching (Security)
- [ ] Auto Minify enabled (JS, CSS, HTML)
- [ ] Brotli compression (automatically enabled)
- [ ] Caching level set to Standard
- [ ] Browser Cache TTL configured properly

### Application Security
- [ ] Security headers added to backend
- [ ] Rate limiting implemented in application
- [ ] CORS properly configured

## 💡 Pro Tips

1. **Start Conservative**: Begin with medium security settings, then increase if needed
2. **Monitor Analytics**: Check security analytics regularly for attack patterns
3. **Test Changes**: Always test security changes on staging first
4. **Document IPs**: Keep a list of your team's IPs for whitelisting
5. **Regular Reviews**: Review and update rules monthly

## 🆙 Future Upgrades (Paid Plans)

When you're ready to upgrade:
- **Pro Plan**: Advanced DDoS protection, 20 page rules, WAF managed rules
- **Business Plan**: Custom SSL certificates, advanced rate limiting
- **Enterprise Plan**: Advanced bot management, custom rules

---

**Last Updated**: June 5, 2025
**Next Review**: Monthly

Remember: Security is a continuous process. Regularly review your settings and adapt based on your traffic patterns and threat landscape.
