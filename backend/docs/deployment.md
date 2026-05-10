# Production Deployment Guide

## 🚀 Deployment Options

### 1. Local Development
### 2. Docker Deployment
### 3. Cloud Deployment (AWS/GCP/Azure)
### 4. Kubernetes Deployment

---

## 🖥️ Local Development Deployment

### Prerequisites

- Python 3.8+
- 2GB+ RAM
- OpenAI or Gemini API key

### Steps

```bash
# 1. Clone repository
cd backend

# 2. Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac

# Edit .env and add API keys

# 5. Run application
python app/main.py

# Or with uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Access

- API: http://localhost:8000
- Docs: http://localhost:8000/docs

---

## 🐳 Docker Deployment

### Single Container

```bash
# 1. Build image
docker build -t legalrag-backend .

# 2. Run container
docker run -d \
  --name legalrag \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  --env-file .env \
  legalrag-backend
```

### Docker Compose

```bash
# 1. Ensure .env file exists
cp .env.example .env
# Edit .env with your API keys

# 2. Start services
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop services
docker-compose down
```

### Docker Commands

```bash
# View running containers
docker ps

# View logs
docker logs legalrag

# Enter container
docker exec -it legalrag bash

# Restart container
docker restart legalrag

# Remove container
docker rm -f legalrag
```

---

## ☁️ AWS Deployment

### Option 1: EC2 Instance

#### 1. Launch EC2 Instance

```bash
# Instance type: t3.medium (2 vCPU, 4GB RAM)
# OS: Ubuntu 22.04 LTS
# Storage: 20GB SSD
# Security Group: Allow ports 22 (SSH), 8000 (API)
```

#### 2. Connect and Setup

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <your-repo-url>
cd backend

# Configure environment
nano .env
# Add your API keys

# Start application
docker-compose up -d
```

#### 3. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx
sudo nano /etc/nginx/sites-available/legalrag

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/legalrag /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. Setup SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Option 2: AWS ECS (Elastic Container Service)

#### 1. Push Image to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name legalrag-backend

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag image
docker build -t legalrag-backend .
docker tag legalrag-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/legalrag-backend:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/legalrag-backend:latest
```

#### 2. Create ECS Task Definition

```json
{
  "family": "legalrag-backend",
  "containerDefinitions": [
    {
      "name": "legalrag",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/legalrag-backend:latest",
      "memory": 2048,
      "cpu": 1024,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "LLM_PROVIDER", "value": "openai"},
        {"name": "OPENAI_API_KEY", "value": "your-key"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/legalrag",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 3. Create ECS Service

```bash
# Create cluster
aws ecs create-cluster --cluster-name legalrag-cluster

# Create service
aws ecs create-service \
  --cluster legalrag-cluster \
  --service-name legalrag-service \
  --task-definition legalrag-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### Option 3: AWS Lambda + API Gateway

For serverless deployment (requires modifications for cold starts).

---

## 🌐 Google Cloud Platform Deployment

### Option 1: Cloud Run (Serverless)

```bash
# 1. Install gcloud CLI
# Follow: https://cloud.google.com/sdk/docs/install

# 2. Authenticate
gcloud auth login
gcloud config set project your-project-id

# 3. Build and deploy
gcloud run deploy legalrag-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars LLM_PROVIDER=openai,OPENAI_API_KEY=your-key \
  --memory 2Gi \
  --cpu 2
```

### Option 2: Compute Engine (VM)

Similar to AWS EC2 deployment.

### Option 3: GKE (Kubernetes)

See Kubernetes section below.

---

## 🔷 Azure Deployment

### Option 1: Azure App Service

```bash
# 1. Install Azure CLI
# Follow: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# 2. Login
az login

# 3. Create resource group
az group create --name legalrag-rg --location eastus

# 4. Create App Service plan
az appservice plan create \
  --name legalrag-plan \
  --resource-group legalrag-rg \
  --sku B2 \
  --is-linux

# 5. Create web app
az webapp create \
  --resource-group legalrag-rg \
  --plan legalrag-plan \
  --name legalrag-backend \
  --deployment-container-image-name legalrag-backend:latest

# 6. Configure environment variables
az webapp config appsettings set \
  --resource-group legalrag-rg \
  --name legalrag-backend \
  --settings LLM_PROVIDER=openai OPENAI_API_KEY=your-key
```

### Option 2: Azure Container Instances

```bash
# Deploy container
az container create \
  --resource-group legalrag-rg \
  --name legalrag-backend \
  --image legalrag-backend:latest \
  --cpu 2 \
  --memory 4 \
  --ports 8000 \
  --environment-variables LLM_PROVIDER=openai OPENAI_API_KEY=your-key
```

---

## ☸️ Kubernetes Deployment

### 1. Create Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: legalrag-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: legalrag
  template:
    metadata:
      labels:
        app: legalrag
    spec:
      containers:
      - name: legalrag
        image: legalrag-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: LLM_PROVIDER
          value: "openai"
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: legalrag-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
```

### 2. Create Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: legalrag-service
spec:
  type: LoadBalancer
  selector:
    app: legalrag
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
```

### 3. Create Secrets

```bash
# Create secret for API key
kubectl create secret generic legalrag-secrets \
  --from-literal=openai-api-key=your-key
```

### 4. Deploy

```bash
# Apply configurations
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/legalrag-backend
```

---

## 🔧 Production Configuration

### Environment Variables

```env
# Production settings
DEBUG=False
LLM_PROVIDER=openai
OPENAI_API_KEY=your-production-key

# Performance
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RETRIEVAL=4

# Security
CORS_ORIGINS=https://your-frontend-domain.com

# Limits
MAX_FILE_SIZE_MB=10
```

### Gunicorn Configuration

For production, use Gunicorn with Uvicorn workers:

```bash
# Install Gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120 \
  --access-logfile logs/access.log \
  --error-logfile logs/error.log
```

### Systemd Service (Linux)

```ini
# /etc/systemd/system/legalrag.service
[Unit]
Description=LegalRAG Backend
After=network.target

[Service]
Type=notify
User=ubuntu
WorkingDirectory=/home/ubuntu/backend
Environment="PATH=/home/ubuntu/backend/venv/bin"
ExecStart=/home/ubuntu/backend/venv/bin/gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable legalrag
sudo systemctl start legalrag
sudo systemctl status legalrag
```

---

## 📊 Monitoring & Logging

### Application Logs

```python
# Logs are in logs/ directory
logs/
├── app_2024-01-15.log
├── app_2024-01-16.log
└── ...
```

### Prometheus Metrics

Add Prometheus metrics:

```python
# Install
pip install prometheus-fastapi-instrumentator

# In app/main.py
from prometheus_fastapi_instrumentator import Instrumentator

Instrumentator().instrument(app).expose(app)
```

### Health Checks

```bash
# Check health
curl http://localhost:8000/health

# Expected response
{
  "status": "healthy",
  "version": "1.0.0",
  "message": "LegalRAG AI Chatbot is running"
}
```

---

## 🔐 Security Best Practices

### 1. API Keys

```bash
# Never commit .env file
echo ".env" >> .gitignore

# Use secrets management
# AWS: AWS Secrets Manager
# GCP: Secret Manager
# Azure: Key Vault
```

### 2. HTTPS

Always use HTTPS in production:

```bash
# Let's Encrypt (free)
sudo certbot --nginx -d your-domain.com
```

### 3. Rate Limiting

Add rate limiting:

```python
# Install
pip install slowapi

# In app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# On routes
@limiter.limit("10/minute")
async def upload_documents(...):
    ...
```

### 4. Authentication

Add JWT authentication:

```python
# Install
pip install python-jose[cryptography] passlib[bcrypt]

# Implement JWT auth
# See: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
```

---

## 🚀 Performance Optimization

### 1. Use GPU for Embeddings

```python
# In app/services/embeddings.py
self.embeddings = HuggingFaceEmbeddings(
    model_name=self.model_name,
    model_kwargs={'device': 'cuda'},  # Use GPU
    encode_kwargs={'normalize_embeddings': True}
)
```

### 2. Caching

Add Redis caching:

```python
# Install
pip install redis

# Cache embeddings
import redis
cache = redis.Redis(host='localhost', port=6379)

def get_cached_embedding(text):
    cached = cache.get(text)
    if cached:
        return pickle.loads(cached)
    
    embedding = generate_embedding(text)
    cache.set(text, pickle.dumps(embedding))
    return embedding
```

### 3. Async Processing

Use background tasks for uploads:

```python
from fastapi import BackgroundTasks

@router.post("/upload")
async def upload_documents(
    files: List[UploadFile],
    background_tasks: BackgroundTasks
):
    session_id = generate_session_id()
    
    # Save files immediately
    file_paths = await save_files(files, session_id)
    
    # Process in background
    background_tasks.add_task(process_documents, file_paths, session_id)
    
    return {"session_id": session_id, "status": "processing"}
```

---

## 📈 Scaling Strategies

### Horizontal Scaling

```
Load Balancer (Nginx/AWS ALB)
    ↓
┌─────────┬─────────┬─────────┐
│ Server 1│ Server 2│ Server 3│
└─────────┴─────────┴─────────┘
    ↓
Shared Storage (S3/NFS)
    ↓
Shared Database (PostgreSQL + pgvector)
```

### Vertical Scaling

- Increase CPU/RAM
- Add GPU for embeddings
- Use SSD for faster I/O

### Database Scaling

Replace FAISS with PostgreSQL + pgvector:

```sql
-- Install pgvector extension
CREATE EXTENSION vector;

-- Create table
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100),
    content TEXT,
    embedding vector(384)
);

-- Create index
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- Search
SELECT content FROM embeddings
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

---

## 🧪 Testing Deployment

### Load Testing

```bash
# Install locust
pip install locust

# Create locustfile.py
from locust import HttpUser, task

class LegalRAGUser(HttpUser):
    @task
    def chat(self):
        self.client.post("/chat", json={
            "session_id": "test-123",
            "question": "What are the terms?"
        })

# Run load test
locust -f locustfile.py --host http://localhost:8000
```

### Smoke Testing

```bash
# Test health
curl http://your-domain.com/health

# Test upload
curl -X POST http://your-domain.com/upload \
  -F "files=@test.pdf"

# Test chat
curl -X POST http://your-domain.com/chat \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test","question":"test"}'
```

---

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] API keys secured
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Health checks working
- [ ] Backups configured
- [ ] Auto-scaling configured
- [ ] Load testing completed
- [ ] Documentation updated

---

## 🆘 Troubleshooting

### Container won't start

```bash
# Check logs
docker logs legalrag

# Common issues:
# - Missing .env file
# - Invalid API key
# - Port already in use
```

### Out of memory

```bash
# Increase container memory
docker run -m 4g ...

# Or reduce chunk size in .env
CHUNK_SIZE=500
```

### Slow performance

```bash
# Use GPU
# Add to docker-compose.yml:
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

---

## 📚 Additional Resources

- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS ECS Guide](https://docs.aws.amazon.com/ecs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Congratulations!** Your LegalRAG backend is now production-ready! 🎉
