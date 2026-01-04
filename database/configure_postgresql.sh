#!/bin/bash

# PostgreSQL 配置脚本 - 允许外部连接

echo "🔧 配置 PostgreSQL 接受外部连接..."

SSH_HOST="tw-07.access.glows.ai"
SSH_PORT="27236"
SSH_USER="glows"
SSH_PASSWORD="tJhRU(-mV2nctf2B"

# 步骤1: 备份配置文件
echo "📋 步骤1: 备份配置文件..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
sudo cp /etc/postgresql/12/main/postgresql.conf /etc/postgresql/12/main/postgresql.conf.backup.$(date +%Y%m%d_%H%M%S)
sudo cp /etc/postgresql/12/main/pg_hba.conf /etc/postgresql/12/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ 配置文件已备份"
EOF

# 步骤2: 修改 postgresql.conf
echo "📋 步骤2: 修改 postgresql.conf (listen_addresses)..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
# 检查当前配置
CURRENT=$(sudo grep -E '^[^#]*listen_addresses' /etc/postgresql/12/main/postgresql.conf | head -1)
echo "当前配置: $CURRENT"

# 如果已经是 '*' 或包含所有地址，跳过
if echo "$CURRENT" | grep -qE "listen_addresses\s*=\s*'\*'|listen_addresses\s*=\s*\*"; then
    echo "✅ listen_addresses 已经配置为 '*'"
else
    # 注释掉旧配置并添加新配置
    sudo sed -i "s/^#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/12/main/postgresql.conf
    sudo sed -i "s/^listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/12/main/postgresql.conf
    
    # 如果文件中没有这个配置，添加它
    if ! sudo grep -qE "^listen_addresses" /etc/postgresql/12/main/postgresql.conf; then
        echo "listen_addresses = '*'" | sudo tee -a /etc/postgresql/12/main/postgresql.conf
    fi
    
    echo "✅ listen_addresses 已设置为 '*'"
fi
EOF

# 步骤3: 修改 pg_hba.conf
echo "📋 步骤3: 修改 pg_hba.conf (添加外部访问规则)..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
# 检查是否已经有这个规则
if sudo grep -qE "host\s+qa_generator_db\s+user\s+0\.0\.0\.0/0" /etc/postgresql/12/main/pg_hba.conf; then
    echo "✅ pg_hba.conf 中已存在外部访问规则"
else
    # 添加外部访问规则
    echo "" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "# Allow external connections for Vercel" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "host    qa_generator_db    user    0.0.0.0/0    md5" | sudo tee -a /etc/postgresql/12/main/pg_hba.conf
    echo "✅ 已添加外部访问规则到 pg_hba.conf"
fi
EOF

# 步骤4: 配置防火墙
echo "📋 步骤4: 配置防火墙..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
# 检查防火墙状态
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(sudo ufw status | head -1)
    if echo "$UFW_STATUS" | grep -q "active"; then
        echo "防火墙状态: 已启用"
        # 检查5432端口是否已开放
        if sudo ufw status | grep -q "5432"; then
            echo "✅ 5432端口已开放"
        else
            echo "开放5432端口..."
            echo "y" | sudo ufw allow 5432/tcp
            echo "✅ 5432端口已开放"
        fi
    else
        echo "防火墙状态: 未启用"
    fi
else
    echo "⚠️  ufw 未安装，跳过防火墙配置"
fi
EOF

# 步骤5: 重启 PostgreSQL
echo "📋 步骤5: 重启 PostgreSQL..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
sudo systemctl restart postgresql
sleep 2
if sudo systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL 重启成功"
else
    echo "❌ PostgreSQL 重启失败，请检查日志"
    sudo systemctl status postgresql
fi
EOF

# 步骤6: 验证配置
echo "📋 步骤6: 验证配置..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
echo "检查 listen_addresses:"
sudo grep -E '^[^#]*listen_addresses' /etc/postgresql/12/main/postgresql.conf | head -1

echo ""
echo "检查 pg_hba.conf 外部访问规则:"
sudo tail -3 /etc/postgresql/12/main/pg_hba.conf

echo ""
echo "检查 PostgreSQL 监听地址:"
sudo netstat -tlnp 2>/dev/null | grep 5432 || sudo ss -tlnp 2>/dev/null | grep 5432
EOF

echo ""
echo "✅ 配置完成！"
echo ""
echo "📝 下一步："
echo "1. 从本地测试外部连接："
echo "   psql \"postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require\""
echo ""
echo "2. 如果连接成功，在 Vercel Dashboard 中设置 DATABASE_URL 环境变量"
echo "3. 重新部署 Vercel 应用"

