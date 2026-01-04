# 如何检查端口转发和代理配置

## 📋 检查清单

### ✅ 已检查（服务器端）

从检查结果看：
- ✅ **服务器上没有HAProxy或Nginx**：没有应用层代理
- ✅ **iptables NAT规则为空**：服务器本身没有配置端口转发
- ✅ **只监听5432端口**：PostgreSQL正常监听

**结论**：端口23793的转发配置**不在服务器上**，而是在**外部网络设备**（云服务商控制面板、路由器、NAT网关等）上配置的。

## 🔍 需要检查的地方

### 1. 云服务商控制面板（最可能）

端口转发通常在云服务商的控制面板中配置。需要检查：

#### AWS
- **EC2控制台** → **安全组（Security Groups）**
- **NAT网关（NAT Gateway）** → **路由表**
- **负载均衡器（Load Balancer）** → **监听器配置**

#### Azure
- **网络（Network）** → **网络安全组（NSG）**
- **负载均衡器（Load Balancer）** → **入站NAT规则**
- **NAT网关（NAT Gateway）**

#### GCP
- **VPC网络** → **防火墙规则**
- **Cloud NAT** → **NAT规则**
- **负载均衡器** → **后端配置**

#### 阿里云
- **专有网络VPC** → **NAT网关** → **DNAT条目**
- **安全组** → **入方向规则**
- **负载均衡** → **监听配置**

#### 腾讯云
- **私有网络VPC** → **NAT网关** → **端口转发规则**
- **安全组** → **入站规则**
- **负载均衡** → **监听器**

### 2. 检查端口转发配置详情

在控制面板中找到端口23793的转发规则，确认：

#### ✅ 检查项1：转发类型
- **应该是**：TCP端口转发（DNAT）
- **不应该是**：HTTP/HTTPS代理、负载均衡（除非配置了TCP模式）

#### ✅ 检查项2：目标配置
- **外部端口**：23793
- **内部IP**：192.168.122.204（或服务器的内网IP）
- **内部端口**：5432
- **协议**：TCP

#### ✅ 检查项3：是否有中间层
检查是否有：
- **负载均衡器**：如果有，确认是TCP模式，不是HTTP模式
- **NAT网关**：确认是直接转发，不是代理模式
- **防火墙规则**：确认允许TCP连接通过

### 3. 测试数据包完整性

使用以下方法测试数据包是否被修改：

#### 方法1：使用tcpdump抓包（在服务器上）

```bash
# SSH到服务器
ssh -p 27236 glows@tw-07.access.glows.ai

# 在服务器上抓包
sudo tcpdump -i any -n -A 'port 5432' -c 20

# 然后在另一个终端尝试连接
# 观察抓到的数据包内容
```

#### 方法2：使用Wireshark分析

1. 在本地使用Wireshark抓包
2. 过滤：`host tw-07.access.glows.ai and port 23793`
3. 尝试连接，观察数据包
4. 检查PostgreSQL启动包是否完整

#### 方法3：使用Python测试脚本

已创建测试脚本：`test_raw_connection.js` 和 `test_with_options.js`

运行这些脚本可以：
- 测试TCP连接
- 发送PostgreSQL协议包
- 检查响应

### 4. 检查是否有协议转换

#### 检查点1：响应内容
如果收到HTTPS/TLS握手，说明有协议转换：
```bash
curl -v telnet://tw-07.access.glows.ai:23793
# 如果返回TLS握手，说明不是纯TCP转发
```

#### 检查点2：数据包大小
PostgreSQL启动包有固定格式，如果被修改，大小会改变：
- 正常启动包：至少20字节
- 如果被修改：可能大小不对或格式错误

### 5. 检查负载均衡器配置（如果适用）

如果使用了负载均衡器，需要确认：

#### HAProxy配置
```bash
# 检查HAProxy配置
sudo cat /etc/haproxy/haproxy.cfg | grep -A 10 "23793\|5432"
```

应该看到类似：
```
backend postgres_backend
    mode tcp  # 必须是TCP模式！
    server pg1 192.168.122.204:5432
```

#### Nginx TCP代理配置
```bash
# 检查Nginx配置
sudo cat /etc/nginx/nginx.conf | grep -A 10 "23793\|5432"
```

应该看到类似：
```
stream {
    server {
        listen 23793;
        proxy_pass 192.168.122.204:5432;
        proxy_timeout 1s;
    }
}
```

## 🎯 推荐检查步骤

### 步骤1：检查云控制面板
1. 登录云服务商控制面板
2. 找到端口转发/NAT规则配置
3. 检查端口23793的配置
4. 确认转发类型是TCP，不是HTTP/HTTPS

### 步骤2：测试数据包
运行检查脚本：
```bash
cd database
./check_proxy.sh
./check_port_forwarding_detailed.sh
```

### 步骤3：抓包分析
在服务器上抓包，观察数据包内容：
```bash
sudo tcpdump -i any -n -A 'port 5432' -c 20
```

### 步骤4：联系管理员
如果无法在控制面板找到配置，联系：
- 服务器管理员
- 云服务商技术支持
- 网络管理员

## 📝 检查结果记录

检查后，记录以下信息：

1. **端口转发位置**：□ 云控制面板  □ 服务器配置  □ 路由器  □ 其他
2. **转发类型**：□ TCP直接转发  □ TCP代理  □ HTTP/HTTPS代理  □ 其他
3. **是否有中间层**：□ 无  □ 负载均衡器  □ NAT网关  □ 其他
4. **数据包是否被修改**：□ 是  □ 否  □ 不确定

## 🔧 如果发现问题

### 问题1：转发类型错误
- **现象**：转发配置为HTTP/HTTPS代理
- **解决**：改为TCP直接转发

### 问题2：有中间代理层
- **现象**：有HAProxy/Nginx等代理
- **解决**：配置代理为TCP模式，不修改数据包

### 问题3：数据包被修改
- **现象**：PostgreSQL收到"invalid length of startup packet"
- **解决**：检查并修复中间层配置，确保不修改数据包

## ✅ 正确的端口转发配置示例

### 云控制面板配置
```
外部端口: 23793
协议: TCP
内部IP: 192.168.122.204
内部端口: 5432
转发类型: DNAT（直接转发）
```

### iptables规则（如果手动配置）
```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 23793 -j DNAT --to-destination 192.168.122.204:5432
sudo iptables -t nat -A POSTROUTING -p tcp -d 192.168.122.204 --dport 5432 -j MASQUERADE
```

