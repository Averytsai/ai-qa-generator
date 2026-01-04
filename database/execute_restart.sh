#!/bin/bash

# PostgreSQL 重启脚本（使用sudo密码）

SSH_HOST="tw-07.access.glows.ai"
SSH_PORT="27236"
SSH_USER="glows"
SSH_PASSWORD="tJhRU(-mV2nctf2B"
SUDO_PASSWORD="tJhRU(-mV2nctf2B"

echo "🔄 重启 PostgreSQL 服务..."
echo ""

# 使用expect来自动输入sudo密码
expect << EOF
set timeout 30
spawn sshpass -p "$SSH_PASSWORD" ssh -p $SSH_PORT -o StrictHostKeyChecking=no -t $SSH_USER@$SSH_HOST

expect {
    "password:" {
        send "$SSH_PASSWORD\r"
        exp_continue
    }
    "\$ " {
        send "echo '$SUDO_PASSWORD' | sudo -S systemctl restart postgresql\r"
        expect "\$ "
        
        send "sleep 2\r"
        expect "\$ "
        
        send "sudo systemctl is-active postgresql && echo 'ACTIVE' || echo 'INACTIVE'\r"
        expect {
            "ACTIVE" {
                puts "\n✅ PostgreSQL 重启成功"
            }
            "INACTIVE" {
                puts "\n❌ PostgreSQL 重启失败"
                send "sudo journalctl -u postgresql -n 20 --no-pager\r"
                expect "\$ "
            }
        }
        
        send "echo '📋 验证配置：'\r"
        expect "\$ "
        
        send "echo '1. listen_addresses:'\r"
        expect "\$ "
        send "sudo grep -E '^[^#]*listen_addresses' /etc/postgresql/12/main/postgresql.conf | head -1\r"
        expect "\$ "
        
        send "echo ''\r"
        expect "\$ "
        send "echo '2. pg_hba.conf 外部访问规则:'\r"
        expect "\$ "
        send "sudo tail -3 /etc/postgresql/12/main/pg_hba.conf\r"
        expect "\$ "
        
        send "echo ''\r"
        expect "\$ "
        send "echo '3. PostgreSQL 监听地址:'\r"
        expect "\$ "
        send "sudo netstat -tlnp 2>/dev/null | grep 5432 || sudo ss -tlnp 2>/dev/null | grep 5432\r"
        expect "\$ "
        
        send "exit\r"
        expect eof
    }
    timeout {
        puts "连接超时"
        exit 1
    }
}
EOF

echo ""
echo "🧪 测试外部连接..."
cd "$(dirname "$0")"
DATABASE_URL="postgresql://user:password@tw-07.access.glows.ai:5432/qa_generator_db?sslmode=require" node test_connection.js

