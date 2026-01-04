#!/bin/bash

# 检查端口转发和代理配置

SSH_HOST="tw-07.access.glows.ai"
SSH_PORT="27236"
SSH_USER="glows"
SSH_PASSWORD="tJhRU(-mV2nctf2B"

echo "🔍 检查端口转发和代理配置..."
echo "=" | head -c 60 && echo ""

echo ""
echo "📋 1. 检查服务器上的网络监听..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
echo "检查所有监听端口（包括23793相关的）:"
echo 'tJhRU(-mV2nctf2B' | sudo -S netstat -tlnp 2>/dev/null | grep -E '23793|5432' || echo 'tJhRU(-mV2nctf2B' | sudo -S ss -tlnp 2>/dev/null | grep -E '23793|5432'

echo ""
echo "检查是否有HAProxy:"
if command -v haproxy >/dev/null 2>&1; then
    echo "✅ HAProxy已安装"
    echo 'tJhRU(-mV2nctf2B' | sudo -S systemctl status haproxy 2>/dev/null | head -5 || echo "HAProxy未运行"
    echo 'tJhRU(-mV2nctf2B' | sudo -S find /etc -name "*haproxy*" -type f 2>/dev/null | head -5
else
    echo "❌ HAProxy未安装"
fi

echo ""
echo "检查是否有Nginx:"
if command -v nginx >/dev/null 2>&1; then
    echo "✅ Nginx已安装"
    echo 'tJhRU(-mV2nctf2B' | sudo -S systemctl status nginx 2>/dev/null | head -5 || echo "Nginx未运行"
    echo 'tJhRU(-mV2nctf2B' | sudo -S find /etc/nginx -name "*.conf" -type f 2>/dev/null | head -5
else
    echo "❌ Nginx未安装"
fi

echo ""
echo "检查iptables NAT规则:"
echo 'tJhRU(-mV2nctf2B' | sudo -S iptables -t nat -L -n -v 2>/dev/null | head -20

echo ""
echo "检查是否有其他代理软件:"
echo 'tJhRU(-mV2nctf2B' | sudo -S ps aux | grep -E 'haproxy|nginx|proxy|socat|nc|netcat' | grep -v grep || echo "未发现明显的代理进程"
EOF

echo ""
echo "📋 2. 检查端口转发数据包..."
echo "测试PostgreSQL协议包传输..."

# 创建测试脚本
cat > /tmp/test_packet.sh << 'TESTEOF'
#!/bin/bash
# 测试PostgreSQL启动包是否被修改

# 发送PostgreSQL启动消息（最小有效包）
# 长度(4字节) + 版本(4字节) + 参数
VERSION="\x00\x03\x00\x00"
PARAMS="user\0user\0database\0qa_generator_db\0\0"
PARAMS_BYTES=$(echo -n "$PARAMS" | wc -c)
TOTAL_LENGTH=$((4 + 4 + PARAMS_BYTES))

# 构建完整消息
LENGTH_BYTES=$(printf "%08x" $TOTAL_LENGTH | sed 's/\(..\)\(..\)\(..\)\(..\)/\\x\4\\x\3\\x\2\\x\1/')
MESSAGE=$(echo -ne "$LENGTH_BYTES$VERSION$PARAMS")

echo "发送PostgreSQL启动包..."
echo -ne "$MESSAGE" | nc -w 3 tw-07.access.glows.ai 23793 | od -An -tx1 | head -10
TESTEOF

chmod +x /tmp/test_packet.sh
/tmp/test_packet.sh

echo ""
echo "📋 3. 检查网络路由..."
echo "从服务器检查到外部IP的路由:"
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
echo "检查到210.66.188.80的路由:"
traceroute -n -m 5 210.66.188.80 2>/dev/null | head -10 || echo "traceroute不可用"

echo ""
echo "检查网络接口:"
ip addr show | grep -E 'inet.*192.168|inet.*10\.|inet.*172\.' | head -5
EOF

echo ""
echo "📋 4. 检查PostgreSQL连接日志（实时监控）..."
echo "（请在另一个终端尝试连接，观察日志）"
echo "按Ctrl+C停止监控"
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
echo 'tJhRU(-mV2nctf2B' | sudo -S tail -f /var/log/postgresql/postgresql-12-main.log 2>/dev/null | head -20 || echo "无法访问日志文件"
EOF

echo ""
echo "✅ 检查完成"

