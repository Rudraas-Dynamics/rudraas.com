# TLS certificates for career.rudraas.com

This directory is bind-mounted read-only into the `nginx` compose service at
`/etc/nginx/certs`. Real certificate material is provisioned out-of-band on
the host (e.g. via certbot) and is **never** committed to this repository -
see the `.gitignore` entry for this directory and `docs/DEPLOYMENT.md` for
the full acquisition/renewal walkthrough.

Expected layout, matching the paths referenced in
`infra/nginx/career.rudraas.com.conf`:

```
infra/nginx/certs/career.rudraas.com/fullchain.pem
infra/nginx/certs/career.rudraas.com/privkey.pem
```
