#!/bin/bash

# AWS Infrastructure Setup Script
# This script helps set up the initial AWS infrastructure for Master Ball

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo -e "${GREEN}Setting up AWS infrastructure for Master Ball...${NC}"

# Create ECR Repository
echo -e "${YELLOW}Creating ECR repository...${NC}"
aws ecr create-repository \
    --repository-name master-ball-api \
    --region ${AWS_REGION} \
    --image-scanning-configuration scanOnPush=true \
    || echo -e "${YELLOW}Repository may already exist${NC}"

# Create ECS Cluster
echo -e "${YELLOW}Creating ECS cluster...${NC}"
aws ecs create-cluster \
    --cluster-name master-ball-cluster \
    --region ${AWS_REGION} \
    || echo -e "${YELLOW}Cluster may already exist${NC}"

# Create CloudWatch Log Group
echo -e "${YELLOW}Creating CloudWatch log group...${NC}"
aws logs create-log-group \
    --log-group-name /ecs/master-ball-api \
    --region ${AWS_REGION} \
    || echo -e "${YELLOW}Log group may already exist${NC}"

echo -e "${GREEN}Infrastructure setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Set up RDS PostgreSQL database"
echo -e "2. Configure Prisma Accelerate"
echo -e "3. Store secrets in AWS Secrets Manager"
echo -e "4. Create IAM roles for ECS tasks"
echo -e "5. Register task definition"
echo -e "6. Create ECS service"

