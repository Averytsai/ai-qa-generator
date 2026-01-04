/**
 * 测试原始PostgreSQL协议连接
 */
const net = require('net');

const HOST = 'tw-07.access.glows.ai';
const PORT = 23793;

console.log(`🔍 测试原始TCP连接到 ${HOST}:${PORT}...`);

const client = new net.Socket();

client.setTimeout(10000);

client.on('connect', () => {
  console.log('✅ TCP连接成功！');
  
  // 发送PostgreSQL启动消息
  // PostgreSQL协议：长度(4字节) + 版本号(4字节) + 参数
  const startupMessage = Buffer.alloc(0);
  
  // 协议版本 3.0
  const version = Buffer.from([0x00, 0x03, 0x00, 0x00]);
  
  // 参数：user=user, database=qa_generator_db
  const params = Buffer.from('user\0user\0database\0qa_generator_db\0\0', 'utf8');
  
  const length = 4 + version.length + params.length;
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(length, 0);
  
  const message = Buffer.concat([lengthBuf, version, params]);
  
  console.log('📤 发送PostgreSQL启动消息...');
  client.write(message);
});

client.on('data', (data) => {
  console.log('📥 收到服务器响应:');
  console.log('长度:', data.length);
  console.log('前32字节(hex):', data.slice(0, 32).toString('hex'));
  console.log('前32字节(ascii):', data.slice(0, 32).toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
  
  // 解析PostgreSQL响应
  if (data.length >= 5) {
    const messageType = data[0];
    const messageLength = data.readUInt32BE(1);
    
    console.log('消息类型:', String.fromCharCode(messageType));
    console.log('消息长度:', messageLength);
    
    if (messageType === 0x52) { // 'R' - Authentication
      console.log('✅ 收到认证请求');
    } else if (messageType === 0x45) { // 'E' - Error
      console.log('❌ 收到错误消息');
      const errorText = data.slice(5).toString('utf8');
      console.log('错误内容:', errorText);
    } else if (messageType === 0x53) { // 'S' - ParameterStatus
      console.log('✅ 收到参数状态');
    }
  }
  
  client.destroy();
});

client.on('error', (error) => {
  console.error('❌ 连接错误:', error.message);
  console.error('错误代码:', error.code);
});

client.on('timeout', () => {
  console.error('❌ 连接超时');
  client.destroy();
});

client.on('close', () => {
  console.log('🔌 连接已关闭');
});

console.log('📡 尝试连接...');
client.connect(PORT, HOST);

