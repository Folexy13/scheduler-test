# Vulnerable Terraform Configuration
# ⚠️ WARNING: Contains intentional security misconfigurations for testing

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  # VULNERABLE: Hardcoded credentials
  access_key = "AKIAIOSFODNN7EXAMPLE"
  secret_key = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
}

# ============================================
# VULNERABLE: S3 Bucket Misconfigurations
# ============================================

resource "aws_s3_bucket" "vulnerable_bucket" {
  bucket = "my-vulnerable-bucket"
  
  # VULNERABLE: Public access enabled
  acl = "public-read-write"
  
  tags = {
    Environment = "production"
  }
}

# VULNERABLE: No encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.vulnerable_bucket.id
  # Missing encryption configuration
}

# VULNERABLE: No versioning
resource "aws_s3_bucket_versioning" "example" {
  bucket = aws_s3_bucket.vulnerable_bucket.id
  versioning_configuration {
    status = "Disabled"
  }
}

# VULNERABLE: No logging
resource "aws_s3_bucket_logging" "example" {
  bucket = aws_s3_bucket.vulnerable_bucket.id
  # Missing logging configuration
}

# ============================================
# VULNERABLE: EC2 Instance Misconfigurations
# ============================================

resource "aws_instance" "vulnerable_instance" {
  ami           = "ami-12345678"
  instance_type = "t2.micro"
  
  # VULNERABLE: Public IP assigned
  associate_public_ip_address = true
  
  # VULNERABLE: No encryption for root volume
  root_block_device {
    encrypted = false
  }
  
  # VULNERABLE: IMDSv1 enabled (allows SSRF attacks)
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "optional"  # Should be "required" for IMDSv2
  }
  
  # VULNERABLE: User data with secrets
  user_data = <<-EOF
    #!/bin/bash
    export DB_PASSWORD="super_secret_password"
    export API_KEY="sk-1234567890abcdef"
    echo "Starting application..."
  EOF
  
  tags = {
    Name = "vulnerable-instance"
  }
}

# ============================================
# VULNERABLE: Security Group Misconfigurations
# ============================================

resource "aws_security_group" "vulnerable_sg" {
  name        = "vulnerable-sg"
  description = "Vulnerable security group"
  
  # VULNERABLE: SSH open to the world
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # VULNERABLE: RDP open to the world
  ingress {
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # VULNERABLE: All ports open
  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # VULNERABLE: All outbound traffic allowed
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ============================================
# VULNERABLE: RDS Database Misconfigurations
# ============================================

resource "aws_db_instance" "vulnerable_db" {
  identifier           = "vulnerable-db"
  engine               = "mysql"
  engine_version       = "5.7"
  instance_class       = "db.t2.micro"
  allocated_storage    = 20
  
  # VULNERABLE: Publicly accessible
  publicly_accessible  = true
  
  # VULNERABLE: No encryption
  storage_encrypted    = false
  
  # VULNERABLE: Weak password
  username             = "admin"
  password             = "password123"
  
  # VULNERABLE: No backup retention
  backup_retention_period = 0
  
  # VULNERABLE: No deletion protection
  deletion_protection  = false
  
  # VULNERABLE: No multi-AZ
  multi_az             = false
  
  # VULNERABLE: Skip final snapshot
  skip_final_snapshot  = true
  
  # VULNERABLE: No IAM authentication
  iam_database_authentication_enabled = false
}

# ============================================
# VULNERABLE: IAM Misconfigurations
# ============================================

resource "aws_iam_policy" "vulnerable_policy" {
  name        = "vulnerable-policy"
  description = "Overly permissive policy"
  
  # VULNERABLE: Wildcard permissions
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "*"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "vulnerable_role" {
  name = "vulnerable-role"
  
  # VULNERABLE: Trust any AWS account
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

# ============================================
# VULNERABLE: Lambda Misconfigurations
# ============================================

resource "aws_lambda_function" "vulnerable_lambda" {
  filename         = "lambda.zip"
  function_name    = "vulnerable-lambda"
  role             = aws_iam_role.vulnerable_role.arn
  handler          = "index.handler"
  runtime          = "nodejs14.x"
  
  # VULNERABLE: Environment variables with secrets
  environment {
    variables = {
      DB_PASSWORD = "super_secret_password"
      API_KEY     = "sk-1234567890abcdef"
      JWT_SECRET  = "my_jwt_secret_key"
    }
  }
  
  # VULNERABLE: No VPC configuration (public internet access)
  # VULNERABLE: No reserved concurrency (DoS risk)
  # VULNERABLE: No dead letter queue
}

# ============================================
# VULNERABLE: CloudTrail Disabled
# ============================================

resource "aws_cloudtrail" "vulnerable_trail" {
  name                          = "vulnerable-trail"
  s3_bucket_name                = aws_s3_bucket.vulnerable_bucket.id
  
  # VULNERABLE: Multi-region disabled
  is_multi_region_trail         = false
  
  # VULNERABLE: Log file validation disabled
  enable_log_file_validation    = false
  
  # VULNERABLE: No encryption
  kms_key_id                    = ""
  
  # VULNERABLE: Management events disabled
  include_global_service_events = false
}

# ============================================
# VULNERABLE: EKS Cluster Misconfigurations
# ============================================

resource "aws_eks_cluster" "vulnerable_cluster" {
  name     = "vulnerable-cluster"
  role_arn = aws_iam_role.vulnerable_role.arn
  
  vpc_config {
    # VULNERABLE: Public endpoint enabled
    endpoint_public_access  = true
    endpoint_private_access = false
    
    # VULNERABLE: No security groups
    security_group_ids = []
  }
  
  # VULNERABLE: No encryption
  # VULNERABLE: No logging
}

# ============================================
# VULNERABLE: KMS Key Misconfigurations
# ============================================

resource "aws_kms_key" "vulnerable_key" {
  description             = "Vulnerable KMS key"
  
  # VULNERABLE: Key rotation disabled
  enable_key_rotation     = false
  
  # VULNERABLE: Overly permissive key policy
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "kms:*"
        Resource  = "*"
      }
    ]
  })
}

# ============================================
# VULNERABLE: SNS Topic Misconfigurations
# ============================================

resource "aws_sns_topic" "vulnerable_topic" {
  name = "vulnerable-topic"
  
  # VULNERABLE: No encryption
  # VULNERABLE: No access policy
}

# ============================================
# VULNERABLE: SQS Queue Misconfigurations
# ============================================

resource "aws_sqs_queue" "vulnerable_queue" {
  name = "vulnerable-queue"
  
  # VULNERABLE: No encryption
  sqs_managed_sse_enabled = false
  
  # VULNERABLE: No dead letter queue
  # VULNERABLE: No access policy
}

# ============================================
# VULNERABLE: ElastiCache Misconfigurations
# ============================================

resource "aws_elasticache_cluster" "vulnerable_cache" {
  cluster_id           = "vulnerable-cache"
  engine               = "redis"
  node_type            = "cache.t2.micro"
  num_cache_nodes      = 1
  
  # VULNERABLE: No encryption at rest
  # VULNERABLE: No encryption in transit
  # VULNERABLE: No auth token
}

# Output sensitive data (VULNERABLE)
output "db_password" {
  value     = aws_db_instance.vulnerable_db.password
  sensitive = false  # VULNERABLE: Should be true
}

output "aws_access_key" {
  value = "AKIAIOSFODNN7EXAMPLE"
}
