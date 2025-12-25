#!/bin/bash

# AWS Deployment Script for Pokemon Hotel API
# This script builds and deploys the application to AWS ECS/Fargate

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration (update these values)
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-""}
ECR_REPOSITORY=${ECR_REPOSITORY:-pokemon-hotel-api}
ECS_CLUSTER=${ECS_CLUSTER:-pokemon-hotel-cluster}
ECS_SERVICE=${ECS_SERVICE:-pokemon-hotel-api}
TASK_DEFINITION=${TASK_DEFINITION:-pokemon-hotel-api}

echo -e "${GREEN}Starting AWS deployment...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Get AWS account ID if not set
if [ -z "$AWS_ACCOUNT_ID" ]; then
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${YELLOW}Detected AWS Account ID: $AWS_ACCOUNT_ID${NC}"
fi

ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

echo -e "${GREEN}Step 1: Building Docker image...${NC}"
docker build -t ${ECR_REPOSITORY}:latest .

echo -e "${GREEN}Step 2: Logging into AWS ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}

echo -e "${GREEN}Step 3: Creating ECR repository if it doesn't exist...${NC}"
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} || \
    aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${AWS_REGION}

echo -e "${GREEN}Step 4: Tagging and pushing image to ECR...${NC}"
docker tag ${ECR_REPOSITORY}:latest ${ECR_URI}:latest
docker push ${ECR_URI}:latest

echo -e "${GREEN}Step 5: Updating ECS service...${NC}"
aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE} \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the new deployment to be live.${NC}"

