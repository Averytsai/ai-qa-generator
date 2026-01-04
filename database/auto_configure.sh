#!/usr/bin/expect -f

# PostgreSQL 自动配置脚本
# 需要 expect: brew install expect

set timeout 30
set SSH_HOST "tw-07.access.glows.ai"
set SSH_PORT "27236"
set SSH_USER "glows"
set SSH_PASSWORD "tJhRU(-mV2nctf2B"

puts "🔧 开始自动配置 PostgreSQL..."
puts ""

spawn ssh -p $SSH_PORT $SSH_USER@$SSH_HOST

expect {
    "password:" {
        send "$SSH_PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "$ " {
        puts "✅ SSH 连接成功"
    }
    timeout {
        puts "❌ SSH 连接超时"
        exit 1
    }
}

# 检查 pg_hba.conf 是否已有规则
puts "\n📋 检查 pg_hba.conf 配置..."
send "sudo grep -q 'qa_generator_db.*user.*0.0.0.0' /etc/postgresql/12/main/pg_hba.conf && echo 'EXISTS' || echo 'NOT_EXISTS'\r"

expect {
    "password for" {
        puts "⚠️  需要 sudo 密码，请输入："
        interact {
            -o
            "password for" {
                stty -echo
                expect_user -re "(.*)\r"
                set sudo_pass $expect_out(1,string)
                stty echo
                send "$sudo_pass\r"
            }
        }
    }
    "EXISTS" {
        puts "✅ pg_hba.conf 中已存在外部访问规则"
        set need_config 0
    }
    "NOT_EXISTS" {
        puts "📝 需要添加外部访问规则"
        set need_config 1
    }
    "$ " {
        # 继续
    }
}

if {$need_config == 1} {
    puts "\n📝 添加外部访问规则到 pg_hba.conf..."
    send "echo '' | sudo tee -a /etc/postgresql/12/main/pg_hba.conf\r"
    expect {
        "password for" {
            interact {
                -o
                "password for" {
                    stty -echo
                    expect_user -re "(.*)\r"
                    set sudo_pass $expect_out(1,string)
                    stty echo
                    send "$sudo_pass\r"
                }
            }
        }
        "$ " {}
    }
    
    send "echo '# Allow external connections for Vercel' | sudo tee -a /etc/postgresql/12/main/pg_hba.conf\r"
    expect {
        "password for" {
            interact {
                -o
                "password for" {
                    stty -echo
                    expect_user -re "(.*)\r"
                    set sudo_pass $expect_out(1,string)
                    stty echo
                    send "$sudo_pass\r"
                }
            }
        }
        "$ " {}
    }
    
    send "echo 'host    qa_generator_db    user    0.0.0.0/0    md5' | sudo tee -a /etc/postgresql/12/main/pg_hba.conf\r"
    expect {
        "password for" {
            interact {
                -o
                "password for" {
                    stty -echo
                    expect_user -re "(.*)\r"
                    set sudo_pass $expect_out(1,string)
                    stty echo
                    send "$sudo_pass\r"
                }
            }
        }
        "$ " {}
    }
    
    puts "✅ 已添加外部访问规则"
}

puts "\n🔄 重启 PostgreSQL..."
send "sudo systemctl restart postgresql\r"
expect {
    "password for" {
        interact {
            -o
            "password for" {
                stty -echo
                expect_user -re "(.*)\r"
                set sudo_pass $expect_out(1,string)
                stty echo
                send "$sudo_pass\r"
            }
        }
    }
    "$ " {}
}

sleep 2

send "sudo systemctl is-active postgresql && echo 'ACTIVE' || echo 'INACTIVE'\r"
expect {
    "ACTIVE" {
        puts "✅ PostgreSQL 重启成功"
    }
    "INACTIVE" {
        puts "❌ PostgreSQL 重启失败"
        send "sudo journalctl -u postgresql -n 20 --no-pager\r"
        expect "$ "
    }
    "$ " {}
}

puts "\n📋 验证配置..."
send "sudo grep 'listen_addresses' /etc/postgresql/12/main/postgresql.conf | grep -v '^#'\r"
expect "$ "

send "sudo tail -3 /etc/postgresql/12/main/pg_hba.conf\r"
expect "$ "

send "sudo netstat -tlnp 2>/dev/null | grep 5432 || sudo ss -tlnp 2>/dev/null | grep 5432\r"
expect "$ "

puts "\n✅ 配置完成！"
puts "\n📝 下一步："
puts "1. 从本地测试外部连接"
puts "2. 在 Vercel Dashboard 中设置 DATABASE_URL 环境变量"
puts "3. 重新部署 Vercel 应用"

send "exit\r"
expect eof

