#!/bin/bash

# 本地测试和部署脚本
# 用法: ./scripts/test-and-deploy.sh "修复了什么功能"

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取 commit message
COMMIT_MSG="${1:-更新代码}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}开始本地测试和部署流程${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 步骤 1: 检查是否有未提交的更改
echo -e "${YELLOW}[1/5] 检查 Git 状态...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✓ 发现未提交的更改${NC}"
else
    echo -e "${YELLOW}⚠ 没有未提交的更改，退出${NC}"
    exit 0
fi

# 步骤 2: 安装 API 依赖
echo ""
echo -e "${YELLOW}[2/5] 安装 API 依赖...${NC}"
cd api
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✓ API 依赖安装完成${NC}"
else
    echo -e "${YELLOW}⚠ 未找到 api/package.json，跳过${NC}"
fi
cd ..

# 步骤 3: 安装前端依赖
echo ""
echo -e "${YELLOW}[3/5] 安装前端依赖...${NC}"
cd frontend
npm install
echo -e "${GREEN}✓ 前端依赖安装完成${NC}"
cd ..

# 步骤 4: 构建前端
echo ""
echo -e "${YELLOW}[4/5] 构建前端项目...${NC}"
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 前端构建成功${NC}"
else
    echo -e "${RED}✗ 前端构建失败${NC}"
    exit 1
fi
cd ..

# 步骤 5: 询问是否提交和推送
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}测试完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Commit 信息: ${YELLOW}${COMMIT_MSG}${NC}"
echo ""
read -p "是否提交并推送到 GitHub? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}[5/5] 提交并推送代码...${NC}"
    
    # 添加所有更改
    git add -A
    
    # 提交
    git commit -m "${COMMIT_MSG}"
    
    # 推送
    git push
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ 代码已成功推送到 GitHub${NC}"
    echo -e "${GREEN}Vercel 会自动检测并部署${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo ""
    echo -e "${YELLOW}已取消推送${NC}"
    echo -e "${YELLOW}代码已准备好，可以稍后手动推送${NC}"
fi

