# Demo Vulnerable Application

This is a **deliberately vulnerable** application designed to test the HayRok CodeFabric Scheduler and security scanning capabilities.

⚠️ **WARNING**: This application contains intentional security vulnerabilities. DO NOT deploy to production!

## Purpose

This demo app is used to test:
- **SAST** (Static Application Security Testing)
- **SCA** (Software Composition Analysis)
- **Secrets Detection**
- **IaC Security** (Infrastructure as Code)
- **Container Security**
- **AI/ML Security** (OWASP LLM Top 10)

## Vulnerabilities Included

### 1. Dependency Vulnerabilities (SCA)
- Outdated packages with known CVEs
- Vulnerable transitive dependencies

### 2. Code Vulnerabilities (SAST)
- SQL Injection
- Cross-Site Scripting (XSS)
- Hardcoded secrets
- Insecure deserialization
- Path traversal

### 3. Infrastructure Vulnerabilities (IaC)
- Misconfigured Terraform
- Insecure Kubernetes manifests
- Docker security issues

### 4. AI/ML Vulnerabilities
- Prompt injection risks
- Insecure model loading
- Unvalidated LLM outputs

## Testing with HayRok Scheduler

### Step 1: Start the Scheduler
```bash
cd scheduler
docker compose -f docker-compose.test.yml up -d
```

### Step 2: Create a Schedule for this Repo
```bash
curl -X POST http://localhost:8004/api/v1/schedules \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: demo-tenant" \
  -d '{
    "tenant_id": "demo-tenant",
    "repo_id": "demo-vulnerable-app",
    "name": "Demo App Security Scan",
    "schedule_type": "baseline",
    "enabled": true,
    "baseline_config": {
      "cron_expression": "0 * * * *",
      "scan_types": ["sast", "sca", "secrets", "iac", "ai_risk"],
      "branch_pattern": "main",
      "full_scan": true
    }
  }'
```

### Step 3: Trigger a Manual Run
```bash
curl -X POST http://localhost:8004/api/v1/runs \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: demo-tenant" \
  -d '{
    "tenant_id": "demo-tenant",
    "repo_id": "demo-vulnerable-app",
    "trigger": {
      "type": "manual",
      "source": "api",
      "actor": "tester@example.com"
    },
    "context": {
      "branch": "main",
      "artifact_type": "repository",
      "artifact_ref": "https://github.com/YOUR_USERNAME/demo-vulnerable-app"
    }
  }'
```

## License

MIT - For testing purposes only
# Scheduler Test - Thu Feb 19 10:04:56 PM WAT 2026
