# Deploy API

## เข้า EC2 Terminal

1. ไป https://console.aws.amazon.com/ec2
2. Instances → คลิก JongjongdiAPI
3. คลิกปุ่ม Connect (มุมขวาบน)
4. Tab: EC2 Instance Connect → Connect

## Deploy

```bash
cd ~/JongJongDi
git pull origin main
DOCKER_BUILDKIT=0 docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## ทดสอบ (รอ 5 วินาทีหลัง up -d)

```bash
sleep 5 && curl -sf http://localhost:4000/health && echo "OK" || echo "FAILED"
```
