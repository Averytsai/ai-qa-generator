#!/bin/bash

# 详细检查端口转发配置

SSH_HOST="tw-07.access.glows.ai"
SSH_PORT="27236"
SSH_USER="glows"
SSH_PASSWORD="tJhRU(-mV2nctf2B"

echo "🔍 详细检查端口转发配置..."
echo "=" | head -c 60 && echo ""

echo ""
echo "📋 1. 检查系统服务（可能涉及端口转发）..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
echo "检查systemd服务:"
systemctl list-units --type=service --state=running | grep -E 'proxy|forward|tunnel|port' || echo "未发现相关服务"

echo ""
echo "检查systemd服务文件:"
find /etc/systemd/system -name "*.service" -type f 2>/dev/null | xargs grep -l "23793\|5432\|forward\|proxy" 2>/dev/null | head -5 || echo "未发现相关服务文件"
EOF

echo ""
echo "📋 2. 检查iptables规则（端口转发可能在这里配置）..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
echo "检查PREROUTING规则（DNAT端口转发）:"
echo 'tJhRU(-mV2nctf2B' | sudo -S iptables -t nat -L PREROUTING -n -v --line-numbers 2>/dev/null | head -20

echo ""
echo "检查OUTPUT规则:"
echo 'tJhRU(-mV2nctf2B' | sudo -S iptables -t nat -L OUTPUT -n -v --line-numbers 2>/dev/null | head -20

echo ""
echo "检查POSTROUTING规则（SNAT/MASQUERADE）:"
echo 'tJhRU(-mV2nctf2B' | sudo -S iptables -t nat -L POSTROUTING -n -v --line-numbers 2>/dev/null | head -20
EOF

echo ""
echo "📋 3. 检查是否有socat或其他端口转发工具..."
sshpass -p "$SSH_PASSWORD" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" << 'EOF'
echo "检查socat进程:"
ps aux | grep -E 'socat|nc -l|netcat.*23793' | grep -v grep || echo "未发现socat/netcat转发进程"

echo ""
echo "检查是否有SSH隧道:"
ps aux | grep -E 'ssh.*23793|ssh.*5432.*23793' | grep -v grep || echo "未发现SSH隧道"
EOF

echo ""
echo "📋 4. 检查云服务商配置（如果适用）..."
echo "如果服务器在云平台上，需要检查："
echo "  - 云控制台的安全组规则"
echo "  - 负载均衡器配置"
echo "  - NAT网关配置"
echo "  - 端口转发规则"
echo ""
echo "常见云平台检查位置："
echo "  - AWS: EC2 Security Groups, NAT Gateway"
echo "  - Azure: Network Security Groups, Load Balancer"
echo "  - GCP: Firewall Rules, Cloud NAT"
echo "  - 阿里云: 安全组, NAT网关"
echo "  - 腾讯云: 安全组, NAT网关"

echo ""
echo "📋 5. 测试数据包完整性..."
echo "发送PostgreSQL启动包并检查响应..."

# 使用Python测试（如果可用）
python3 << 'PYEOF'
import socket
import struct

HOST = 'tw-07.access.glows.ai'
PORT = 23793

try:
    # 创建socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(5)
    sock.connect((HOST, PORT))
    print(f"✅ TCP连接到 {HOST}:{PORT} 成功")
    
    # 构建PostgreSQL启动消息
    # 协议版本 3.0
    version = struct.pack('>I', 0x00030000)
    
    # 参数
    params = b'user\x00user\x00database\x00qa_generator_db\x00\x00'
    
    # 总长度
    total_length = 4 + len(version) + len(params)
    length = struct.pack('>I', total_length)
    
    # 完整消息
    message = length + version + params
    
    print(f"📤 发送启动包，长度: {len(message)} 字节")
    print(f"   前16字节(hex): {message[:16].hex()}")
    
    sock.sendall(message)
    
    # 接收响应
    response = sock.recv(1024)
    if response:
        print(f"📥 收到响应，长度: {len(response)} 字节")
        print(f"   前32字节(hex): {response[:32].hex()}")
        print(f"   前32字节(ascii): {response[:32].decode('ascii', errors='replace')}")
        
        # 检查是否是PostgreSQL响应
        if len(response) >= 1:
            msg_type = response[0]
            if msg_type == ord('R'):  # Authentication
                print("✅ 收到PostgreSQL认证请求（正常）")
            elif msg_type == ord('E'):  # Error
                print("❌ 收到PostgreSQL错误消息")
                error_msg = response[5:].decode('utf-8', errors='replace')
                print(f"   错误: {error_msg[:100]}")
            else:
                print(f"⚠️  收到未知消息类型: {chr(msg_type) if 32 <= msg_type <= 126 else '?'}")
    else:
        print("❌ 未收到响应")
    
    sock.close()
    
except Exception as e:
    print(f"❌ 错误: {e}")
PYEOF

echo ""
echo "✅ 检查完成"

