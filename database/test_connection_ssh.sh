#!/bin/bash

# 通过SSH测试数据库连接

echo "🔍 通过SSH测试数据库连接..."

# SSH连接信息
SSH_HOST="tw-07.access.glows.ai"
SSH_PORT="27236"
SSH_USER="glows"
SSH_PASSWORD="tJhRU(-mV2nctf2B"

# 数据库连接信息
DB_HOST="localhost"  # 在SSH服务器上，数据库是localhost
DB_PORT="5432"
DB_NAME="qa_generator_db"
DB_USER="user"
DB_PASSWORD="password"

echo "📋 步骤1: 检查PostgreSQL服务是否运行..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" \
  "sudo systemctl status postgresql || sudo service postgresql status || pg_isready -h localhost -p 5432"

echo ""
echo "📋 步骤2: 测试数据库连接..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" \
  "PGPASSWORD='$DB_PASSWORD' psql -h localhost -p $DB_PORT -U $DB_USER -d $DB_NAME -c 'SELECT version();'"

echo ""
echo "📋 步骤3: 检查表是否存在..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" \
  "PGPASSWORD='$DB_PASSWORD' psql -h localhost -p $DB_PORT -U $DB_USER -d $DB_NAME -c \"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;\""

echo ""
echo "📋 步骤4: 检查qa_pairs表结构..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" \
  "PGPASSWORD='$DB_PASSWORD' psql -h localhost -p $DB_PORT -U $DB_USER -d $DB_NAME -c \"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'qa_pairs' ORDER BY ordinal_position;\""

echo ""
echo "✅ 测试完成！"

