# GoDaddy DNS Setup — PaySurity Tenant Microsites

## Architecture Decision
**No separate GCP project per tenant.** The PaySurity platform is multi-tenant by design.
Each tenant gets a subdomain/path on the same Cloud Run API and Next.js public website.

## How Tenant Microsites Work
```
houseofbiryanirestaurant.food  →  CNAME →  paysurity-public-website.vercel.app
                                OR
houseofbiryanirestaurant.food  →  A record → Cloud Run IP (via load balancer)
```

The public website Next.js app reads the `Host` header and serves the correct tenant.

## GoDaddy Settings for houseofbiryanirestaurant.food

### Option A: Simple Forward (Staging/Testing — fastest)
1. Log into GoDaddy → Manage DNS for **houseofbiryanirestaurant.food**
2. Delete any existing A and CNAME records on @
3. Add: **Forwarding** → forward to: `https://paysurity-[hash]-uc.a.run.app/restaurant/house-of-biryani`
4. Type: Permanent (301), Forward only
5. ✅ Takes effect in 1-24 hours

### Option B: Full CNAME (Production — recommended)
1. Log into GoDaddy → DNS Management for **houseofbiryanirestaurant.food**
2. Add CNAME record:
   - Host: `@` (or `www`)
   - Points to: `paysurity-api-111328865246-uc.a.run.app`
   - TTL: 1 hour
3. Add TXT record for domain verification:
   - Host: `@`
   - Value: `paysurity-tenant=house-of-biryani-chicago-2026`
4. Configure Cloud Run custom domain mapping (see below)

### Cloud Run Custom Domain Mapping
```bash
gcloud beta run domain-mappings create \
  --service=paysurity-api \
  --domain=houseofbiryanirestaurant.food \
  --region=us-central1 \
  --project=paysurity-platform-2026
```

### Option C: SEO-Friendly (Recommended for growth)
Forward: **houseofbiryanirestaurant.food** → **paysurity.com/restaurants/house-of-biryani**

This gives PaySurity SEO benefits while tenants get branded URLs.

## Repeat for Tawakkul Restaurant
Same steps but for domain: **tawakkulrestaurant.food**
Tenant ID: tawakkul-restaurant-chicago-2026

## Staging Test (Before DNS propagation)
Test the microsite immediately via:
`https://paysurity-api-[hash]-uc.a.run.app/restaurant/house-of-biryani`

Check the Cloud Run URL with:
```bash
gcloud run services describe paysurity-api --region=us-central1 --format="value(status.url)"
```

## SSL
Cloud Run provides automatic SSL via Google-managed certificates when custom domains are mapped.
No separate certificate configuration needed.
