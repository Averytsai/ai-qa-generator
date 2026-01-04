#!/bin/bash

# 检查端口转发配置

SSH_HOST="tw-07.access.glows.ai"
SSH_PORT="27236"
SSH_USER="glows"
SSH_PASSWORD="tJhRU(-mV2nctf2B"

echo "🔍 检查端口转发配置..."
echo ""

echo "📋 1. 检查服务器上PostgreSQL监听状态..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
echo "PostgreSQL监听地址:"
echo 'tJhRU(-mV2nctf2B' | sudo -S netstat -tlnp 2>/dev/null | grep 5432 || echo 'tJhRU(-mV2nctf2B' | sudo -S ss -tlnp 2>/dev/null | grep 5432

echo ""
echo "检查端口23793:"
echo 'tJhRU(-mV2nctf2B' | sudo -S lsof -i :23793 2>/dev/null || echo "端口23793未在服务器上监听（这是正常的，因为它是外部端口转发）"
EOF

echo ""
echo "📋 2. 从服务器测试本地PostgreSQL连接..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
PGPASSWORD='password' psql -h localhost -p 5432 -U user -d qa_generator_db -c "SELECT '本地连接成功' as status, version() as version;" 2>&1 | head -5
EOF

echo ""
echo "📋 3. 测试外部端口23793连接..."
echo "尝试PostgreSQL协议握手..."
echo -e "\x00\x00\x00\x08\x04\xd2\x16\x2f" | nc -w 3 tw-07.access.glows.ai 23793 2>&1 | od -An -tx1 | head -5 || echo "无法建立PostgreSQL协议连接"

echo ""
echo "📋 4. 检查是否有代理或网关..."
curl -v https://tw-07.access.glows.ai:23793/ 2>&1 | head -15

echo ""
echo "✅ 检查完成"

