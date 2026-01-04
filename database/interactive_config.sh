#!/bin/bash

# PostgreSQL 交互式配置脚本

SSH_HOST="tw-07.access.glows.ai"
SSH_PORT="27236"
SSH_USER="glows"
SSH_PASSWORD="tJhRU(-mV2nctf2B"

echo "🔧 PostgreSQL 外部连接配置"
echo "================================"
echo ""
echo "此脚本将："
echo "1. 连接到服务器"
echo "2. 配置 pg_hba.conf 允许外部连接"
echo "3. 重启 PostgreSQL 服务"
echo ""
echo "⚠️  注意：需要 sudo 权限，会提示输入密码"
echo ""
read -p "按 Enter 继续，或 Ctrl+C 取消..."

# 创建临时脚本在服务器上执行
cat > /tmp/postgres_config.sh << 'EOF'
#!/bin/bash

echo ""
echo "📋 步骤1: 检查并添加 pg_hba.conf 规则..."
if sudo grep -qE "host\s+qa_generator_db\s+user\s+0\.0\.0\.0/0" /etc/postgresql/12/main/pg_hba.conf 2>/dev/null; then
    echo "✅ pg_hba.conf 中已存在外部访问规则"
else
    echo "📝 添加外部访问规则..."
    echo "" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "# Allow external connections for Vercel" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "host    qa_generator_db    user    0.0.0.0/0    md5" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "✅ 已添加外部访问规则"
fi

echo ""
echo "📋 步骤2: 重启 PostgreSQL..."
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
echo "📋 步骤3: 验证配置..."
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
EOF

chmod +x /tmp/postgres_config.sh

echo ""
echo "📤 上传配置脚本到服务器..."
sshpass -p "$SSH_PASSWORD" scp -P "$SSH_PORT" -o StrictHostKeyChecking=no /tmp/postgres_config.sh "$SSH_USER@$SSH_HOST:/tmp/postgres_config.sh"

echo ""
echo "🚀 在服务器上执行配置..."
echo "（会提示输入 sudo 密码）"
echo ""
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no -t "$SSH_USER@$SSH_HOST" "bash /tmp/postgres_config.sh && rm /tmp/postgres_config.sh"

echo ""
echo "🧪 测试外部连接..."
cd "$(dirname "$0")"
DATABASE_URL="postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require" node test_connection.js

echo ""
echo "📝 下一步："
echo "1. 如果连接测试成功，在 Vercel Dashboard 中设置 DATABASE_URL 环境变量"
echo "2. 设置 OPENAI_API_KEY 环境变量"
echo "3. 重新部署 Vercel 应用"

