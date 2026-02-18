# Vulnerable Dockerfile
# ⚠️ WARNING: Contains intentional security misconfigurations for testing

# VULNERABLE: Using outdated base image with known CVEs
FROM node:14.15.0

# VULNERABLE: Running as root (no USER instruction)

# VULNERABLE: Hardcoded secrets in environment variables
ENV DB_PASSWORD=super_secret_password
ENV API_KEY=sk-1234567890abcdef
ENV JWT_SECRET=my_jwt_secret_key
ENV AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
ENV AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
ENV GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ENV OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# VULNERABLE: Installing unnecessary packages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    vim \
    nano \
    telnet \
    netcat \
    nmap \
    tcpdump \
    strace \
    sudo \
    ssh \
    && rm -rf /var/lib/apt/lists/*

# VULNERABLE: Adding user to sudoers
RUN echo "node ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

WORKDIR /app

# VULNERABLE: Copying all files including secrets
COPY . .

# VULNERABLE: Installing dependencies without lockfile integrity check
RUN npm install --unsafe-perm

# VULNERABLE: Exposing multiple ports
EXPOSE 3000 22 3306 5432 6379 27017

# VULNERABLE: Running as root with full capabilities
# No USER instruction to drop privileges

# VULNERABLE: Using shell form instead of exec form
CMD npm start

# VULNERABLE: No health check
# HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000/health || exit 1

# VULNERABLE: No read-only filesystem
# No --read-only flag

# VULNERABLE: Labels with sensitive information
LABEL maintainer="admin@example.com"
LABEL api_key="sk-1234567890abcdef"
LABEL db_password="super_secret_password"
