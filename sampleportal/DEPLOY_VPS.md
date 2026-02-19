# VPS Deploy Guide: sampleportal.rspur.com

## 1) Environment
Create `.env.local` in project root:

```env
AUTH_SECRET=replace_with_a_long_random_secret
NEXT_PUBLIC_APP_DOMAIN=sampleportal.rspur.com
```

Generate secret:

```bash
openssl rand -base64 32
```

## 2) Install + build
```bash
cd ~/apps/sampleportal
npm install
npm run build
```

## 3) Run with PM2
```bash
pm2 start npm --name "sampleportal" -- start
pm2 save
```

## 4) Nginx reverse proxy
`/etc/nginx/sites-available/sampleportal.rspur.com`

```nginx
server {
    server_name sampleportal.rspur.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable + reload:

```bash
sudo ln -s /etc/nginx/sites-available/sampleportal.rspur.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5) SSL
```bash
sudo certbot --nginx -d sampleportal.rspur.com
```

## 6) Update deploy flow
```bash
cd ~/apps/sampleportal
git pull
npm install
npm run build
pm2 restart sampleportal
```
