#!/bin/bash

# 完成 PostgreSQL 配置（需要 sudo 密码）

SSH_HOST="tw-07.access.glows.ai"
SSH_PORT="27236"
SSH_USER="glows"
SSH_PASSWORD="tJhRU(-mV2nctf2B"
SUDO_PASSWORD=""  # 如果需要sudo密码，请在这里填写

echo "🔧 完成 PostgreSQL 配置..."
echo ""
echo "⚠️  注意：此脚本需要 sudo 权限"
echo "如果提示输入密码，请输入 sudo 密码"
echo ""

# 使用 expect 或直接 SSH 交互式操作
# 由于需要 sudo，我们创建一个临时脚本在服务器上执行

sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no -t "$SSH_USER@$SSH_HOST" << 'ENDSSH'
# 检查 pg_hba.conf 是否已有外部访问规则
if sudo grep -qE "host\s+qa_generator_db\s+user\s+0\.0\.0\.0/0" /etc/postgresql/12/main/pg_hba.conf 2>/dev/null; then
    echo "✅ pg_hba.conf 中已存在外部访问规则"
else
    echo "📝 添加外部访问规则到 pg_hba.conf..."
    echo "" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "# Allow external connections for Vercel" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "host    qa_generator_db    user    0.0.0.0/0    md5" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "✅ 已添加外部访问规则"
fi

echo ""
echo "🔄 重启 PostgreSQL..."
sudo systemctl restart postgresql
sleep 2

if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL 重启成功"
else
    echo "❌ PostgreSQL 重启失败"
    echo "查看日志："
    sudo journalctl -u postgresql -n 20 --no-pager
    exit 1
fi

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

echo ""
echo "✅ 配置完成！"
ENDSSH

echo ""
echo "📝 下一步："
echo "1. 从本地测试外部连接："
echo "   psql \"postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require\""
echo ""
echo "2. 如果连接成功，在 Vercel Dashboard 中设置 DATABASE_URL 环境变量"
echo "3. 重新部署 Vercel 应用"

