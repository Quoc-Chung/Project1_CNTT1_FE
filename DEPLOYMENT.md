# Deployment Guide

## Hướng dẫn Deploy Next.js Commerce lên VPS

### Yêu cầu trên VPS:
- Docker và Docker Compose đã cài đặt
- Port 3000 mở (hoặc port tùy chỉnh)
- Tối thiểu 2GB RAM
- 10GB disk space

---

## 🚀 Các Scripts có sẵn:

### 1. `./build.sh` - Build Docker Image
Tạo Docker image mới từ source code
```bash
./build.sh
```

### 2. `./start.sh` - Khởi động Application
Chạy container từ image đã build
```bash
./start.sh
```

### 3. `./stop.sh` - Dừng Application
Dừng container đang chạy
```bash
./stop.sh
```

### 4. `./logs.sh` - Xem Logs
Xem logs real-time của application
```bash
./logs.sh
```

### 5. `./clean.sh` - Dọn dẹp Docker
Xóa containers, images cũ để tiết kiệm dung lượng
```bash
./clean.sh
```

---

## 📋 Quy trình Deploy lần đầu:

### Bước 1: Upload code lên VPS
```bash
# Sử dụng git
git clone <your-repo-url>
cd ProjectFrontendOne

# Hoặc sử dụng scp/rsync
scp -r . user@vps-ip:/path/to/app
```

### Bước 2: Build và chạy
```bash
# Build image
./build.sh

# Khởi động app
./start.sh
```

### Bước 3: Kiểm tra
```bash
# Xem logs
./logs.sh

# Kiểm tra container
docker ps

# Test app
curl http://localhost:3000
```

---

## 🔄 Quy trình Update code:

```bash
# 1. Pull code mới
git pull

# 2. Stop container cũ
./stop.sh

# 3. Build lại
./build.sh

# 4. Start lại
./start.sh
```

---

## 🌐 Setup Nginx Reverse Proxy (Optional nhưng Recommend):

### 1. Cài đặt Nginx:
```bash
sudo apt update
sudo apt install nginx
```

### 2. Tạo config file:
```bash
sudo nano /etc/nginx/sites-available/nextjs-commerce
```

### 3. Nội dung config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
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

### 4. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/nextjs-commerce /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Setup SSL với Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔧 Environment Variables:

Tạo file `.env.production` (nếu cần):
```bash
NEXT_PUBLIC_API_URL=http://your-api-url:8080
NODE_ENV=production
```

Update trong `docker-compose.yml`:
```yaml
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
```

---

## 📊 Monitoring:

### Xem trạng thái:
```bash
docker ps
docker stats nextjs-commerce
```

### Xem logs:
```bash
./logs.sh
# hoặc
docker-compose logs -f
```

### Restart nếu có lỗi:
```bash
./stop.sh && ./start.sh
```

---

## 🛠️ Troubleshooting:

### Container không start:
```bash
# Xem logs chi tiết
docker-compose logs

# Check port conflict
sudo netstat -tulpn | grep :3000

# Rebuild từ đầu
./clean.sh
./build.sh
./start.sh
```

### Out of memory:
```bash
# Giới hạn memory cho container
# Thêm vào docker-compose.yml:
deploy:
  resources:
    limits:
      memory: 1G
```

### Disk đầy:
```bash
# Dọn dẹp
./clean.sh

# Hoặc dọn toàn bộ
docker system prune -a --volumes
```

---

## 🔒 Security Checklist:

- [ ] Đổi port mặc định (optional)
- [ ] Setup firewall (ufw)
- [ ] Enable SSL/HTTPS
- [ ] Disable root login SSH
- [ ] Setup fail2ban
- [ ] Regular updates
- [ ] Backup data

---

## 📞 Support:

Nếu gặp vấn đề, check:
1. Logs: `./logs.sh`
2. Container status: `docker ps -a`
3. Disk space: `df -h`
4. Memory: `free -h`
