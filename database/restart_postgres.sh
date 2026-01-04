#!/bin/bash

# PostgreSQL 重启脚本（需要手动输入 sudo 密码）

SSH_HOST="tw-07.access.glows.ai"
SSH_PORT="27236"
SSH_USER="glows"
SSH_PASSWORD="tJhRU(-mV2nctf2B"

echo "🔄 重启 PostgreSQL 服务..."
echo ""
echo "⚠️  需要 sudo 权限，会提示输入密码"
echo ""

sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no -t "$SSH_USER@$SSH_HOST" << 'EOF'
echo "重启 PostgreSQL..."
sudo systemctl restart postgresql

sleep 2

if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL 重启成功"
    echo ""
    echo "📋 验证配置："
    echo "1. listen_addresses:"
    sudo grep -E '^[^#]*listen_addresses' /etc/postgresql/12/main/postgresql.conf | head -1
    echo ""
    echo "2. pg_hba.conf 外部访问规则:"
    sudo tail -3 /etc/postgresql/12/main/pg_hba.conf
    echo ""
    echo "3. PostgreSQL 监听地址:"
    sudo netstat -tlnp 2>/dev/null | grep 5432 || sudo ss -tlnp 2>/dev/null | grep 5432
else
    echo "❌ PostgreSQL 重启失败"
    echo "查看日志："
    sudo journalctl -u postgresql -n 20 --no-pager
fi
EOF

echo ""
echo "🧪 测试外部连接..."
cd "$(dirname "$0")"
DATABASE_URL="postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require" node test_connection.js

