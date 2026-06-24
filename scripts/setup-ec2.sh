#!/bin/bash
# Run once on a fresh Amazon Linux 2023 EC2 instance
set -e

echo "=== Installing Docker ==="
sudo dnf update -y
sudo dnf install -y docker git curl
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

echo "=== Installing Docker Compose plugin ==="
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

echo "=== Cloning repo ==="
cd ~
git clone https://github.com/jirapatjames0305/JongJongDi.git
cd JongJongDi

echo ""
echo "=== DONE - Next steps: ==="
echo "1. Re-login (to apply docker group): exit, then ssh back in"
echo "2. Create env: nano ~/JongJongDi/apps/api/.env.production"
echo "3. Deploy: bash ~/JongJongDi/scripts/deploy.sh"
