#!/bin/bash

# 部署脚本
# 用法: ./scripts/deploy.sh "修复了什么功能" "详细说明"

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取参数
SHORT_MSG="${1}"
DETAIL_MSG="${2}"

# 如果没有提供参数，提示输入
if [ -z "$SHORT_MSG" ]; then
    echo -e "${BLUE}请输入本次修改的简要说明：${NC}"
    read -r SHORT_MSG
fi

if [ -z "$DETAIL_MSG" ]; then
    echo -e "${BLUE}请输入详细说明（可选，按 Enter 跳过）：${NC}"
    read -r DETAIL_MSG
fi

# 构建完整的 commit message
if [ -n "$DETAIL_MSG" ]; then
    COMMIT_MSG="${SHORT_MSG}

${DETAIL_MSG}"
else
    COMMIT_MSG="${SHORT_MSG}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}修改说明:${NC} ${YELLOW}${SHORT_MSG}${NC}"
if [ -n "$DETAIL_MSG" ]; then
    echo -e "${BLUE}详细说明:${NC} ${YELLOW}${DETAIL_MSG}${NC}"
fi
echo ""
echo -e "${BLUE}Commit 信息:${NC}"
echo -e "${YELLOW}${COMMIT_MSG}${NC}"
echo ""

# 确认
read -p "确认提交并推送? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}已取消${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}[1/4] 检查 Git 状态...${NC}"
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠ 没有未提交的更改${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}[2/4] 安装依赖...${NC}"

# 安装 API 依赖
if [ -d "api" ] && [ -f "api/package.json" ]; then
    echo "  安装 API 依赖..."
    cd api
    npm install --silent
    cd ..
fi

# 安装前端依赖
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
    echo "  安装前端依赖..."
    cd frontend
    npm install --silent
    cd ..
fi

echo ""
echo -e "${YELLOW}[3/4] 构建前端...${NC}"
cd frontend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 构建成功${NC}"
else
    echo -e "${RED}✗ 构建失败${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${YELLOW}[4/4] 提交并推送...${NC}"
git add -A
git commit -m "${COMMIT_MSG}"
git push

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}下一步:${NC}"
echo -e "1. 检查 Vercel Dashboard 查看部署状态"
echo -e "2. 等待部署完成后测试功能"
echo ""

