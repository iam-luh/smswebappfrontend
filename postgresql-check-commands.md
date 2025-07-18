# PostgreSQL Database Check Commands for Hostinger VPS

## 1. SSH into your Hostinger VPS
```bash
# Use the SSH details from your Hostinger VPS panel
ssh root@your-hostinger-vps-ip
# or if you have username and password/key
ssh username@your-hostinger-vps-ip

# Hostinger VPS typically uses Ubuntu, so these commands should work
```

## 1.1. Hostinger VPS Specific Checks
```bash
# Check system information
lsb_release -a
uname -a

# Check available memory and disk space
free -h
df -h

# Check if Docker is installed (common on Hostinger VPS)
docker --version
docker ps -a
docker images

# Check if PostgreSQL is running in Docker containers
docker ps | grep postgres
docker container ls --filter "ancestor=postgres"
```

## 2. Check if PostgreSQL is installed and running
```bash
# Check PostgreSQL service status
sudo systemctl status postgresql

# Alternative ways to check if PostgreSQL is running
ps aux | grep postgres
sudo service postgresql status
```

## 3. Check PostgreSQL version
```bash
psql --version
# or
postgres --version
```

## 4. Check PostgreSQL processes
```bash
# Show all PostgreSQL processes
ps -ef | grep postgres

# Show PostgreSQL listening ports
sudo netstat -tulnp | grep postgres
# or using ss command
sudo ss -tulnp | grep postgres
```

## 5. Check PostgreSQL configuration and data directories
```bash
# Find PostgreSQL configuration files
sudo find / -name "postgresql.conf" 2>/dev/null

# Find PostgreSQL data directory
sudo find / -name "pg_hba.conf" 2>/dev/null

# Check default data directory
ls -la /var/lib/postgresql/
```

## 6. Connect to PostgreSQL (if running locally)
```bash
# Connect as postgres user
sudo -u postgres psql

# List all databases
sudo -u postgres psql -l

# Connect to a specific database
sudo -u postgres psql -d database_name
```

## 7. Check PostgreSQL clusters (Ubuntu/Debian)
```bash
# List PostgreSQL clusters
sudo pg_lsclusters

# Check cluster status
sudo pg_ctlcluster 12 main status
```

## 8. Check PostgreSQL logs
```bash
# Common log locations
sudo tail -f /var/log/postgresql/postgresql-*.log

# Or check systemd logs
sudo journalctl -u postgresql -f
```

## 9. Check listening ports and connections
```bash
# Check what's listening on port 5432 (default PostgreSQL port)
sudo lsof -i :5432

# Check all listening ports
sudo netstat -tulnp | grep LISTEN
```

## 10. Check PostgreSQL installation packages
```bash
# On Ubuntu/Debian
dpkg -l | grep postgres

# On CentOS/RHEL
rpm -qa | grep postgres
```

## Quick troubleshooting commands
```bash
# Start PostgreSQL service
sudo systemctl start postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql

# Restart PostgreSQL service
sudo systemctl restart postgresql

# Check PostgreSQL service logs
sudo journalctl -u postgresql --since "1 hour ago"
```

## Hostinger VPS Specific Notes
```bash
# Hostinger VPS often comes with pre-installed services
# Check what's already running
sudo systemctl list-units --type=service --state=running

# If PostgreSQL is in Docker (common setup)
# Check Docker logs for PostgreSQL container
docker logs container-name-or-id

# Hostinger VPS firewall check
sudo ufw status
sudo iptables -L

# Check network configuration
ip addr show
sudo netstat -tulnp

# If using managed database service
# Check if connecting to external PostgreSQL (like DigitalOcean)
ping your-db-host
telnet your-db-host 25060
```

## Testing Database Connection
```bash
# Test connection to your external PostgreSQL database
psql "postgresql://your-username:your-password@your-db-host:25060/defaultdb"

# Or test connection step by step
telnet your-db-host 25060
# If connection works, try psql
psql -h your-db-host -U your-username -p 25060 -d defaultdb
```

## Connect to Your Local PostgreSQL Database (stockdb)
```bash
# If PostgreSQL is running locally on the VPS
psql -h localhost -U stockuser -d stockdb -p 5432

# If PostgreSQL is running in Docker container
docker exec -it postgres_db psql -U stockuser -d stockdb

# Alternative Docker connection method
docker exec -it postgres_db bash
# Then inside the container:
psql -U stockuser -d stockdb

# Direct connection with password (will prompt for password: stockpassword)
PGPASSWORD=stockpassword psql -h localhost -U stockuser -d stockdb -p 5432
```

## Check Tables in Your Database
```bash
# After connecting to your database, run these SQL commands:

# List all tables in the current database
\dt

# List all tables with more details
\dt+

# List all tables in all schemas
\dt *.*

# Show table structure for a specific table
\d table_name

# List all databases
\l

# List all users/roles
\du

# Show current database and user
SELECT current_database(), current_user;

# Show all tables with row counts
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public';

# Get table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

## Docker-specific Database Commands
```bash
# Check if your PostgreSQL container is running
docker ps | grep postgres_db

# Check container logs
docker logs postgres_db

# Start the container if it's stopped
docker start postgres_db

# Check container status
docker inspect postgres_db

# Connect to the database container directly
docker exec -it postgres_db bash

# Run SQL commands directly from command line
docker exec -it postgres_db psql -U stockuser -d stockdb -c "\dt"
docker exec -it postgres_db psql -U stockuser -d stockdb -c "SELECT * FROM information_schema.tables WHERE table_schema = 'public';"
```

## Get PostgreSQL Connection String for Your Docker Database

### Step 1: Find Your PostgreSQL Container Details
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres_db

# Get detailed container information including network settings
docker inspect postgres_db

# Check container IP address
docker inspect postgres_db | grep IPAddress

# Check which port PostgreSQL is mapped to on the host
docker port postgres_db
```

### Step 2: Determine Connection Details
```bash
# Your database credentials:
# Database Name: stockdb
# Username: stockuser  
# Password: stockpassword
# Container Name: postgres_db

# Check if port 5432 is exposed to host
docker inspect postgres_db | grep -A 5 -B 5 "5432"

# If running on same Docker network, use container name as host
# If exposed to host, use localhost or VPS IP
```

### Step 3: Build Connection String Options

**Option A - Internal Docker Network (Recommended for Docker containers)**
```bash
# If your backend is also in Docker and on same network
# Connection string format:
postgresql://stockuser:stockpassword@postgres_db:5432/stockdb

# Test this connection from another container
docker run --rm --network container:postgres_db postgres:latest psql postgresql://stockuser:stockpassword@postgres_db:5432/stockdb -c "\l"
```

**Option B - Host Network Access**
```bash
# If PostgreSQL port is exposed to host (check with docker port postgres_db)
# Connection string format:
postgresql://stockuser:stockpassword@localhost:5432/stockdb
# or
postgresql://stockuser:stockpassword@your-vps-ip:5432/stockdb

# Test this connection
psql postgresql://stockuser:stockpassword@localhost:5432/stockdb -c "\l"
```

### Step 4: Update Backend Environment Variables
```bash
# Edit your backend .env file
# Replace the DigitalOcean connection with your local PostgreSQL

# OLD (DigitalOcean):
# DATABASE_URL=postgresql://your-username:your-password@your-db-host:25060/defaultdb

# NEW (Your Docker PostgreSQL):
DATABASE_URL=postgresql://stockuser:stockpassword@postgres_db:5432/stockdb

# Or if using host network:
# DATABASE_URL=postgresql://stockuser:stockpassword@localhost:5432/stockdb
```

### Step 5: Test Connection from Backend Container
```bash
# If your backend is also in Docker, test connection
docker exec -it your-backend-container-name npm test
# or test database connection specifically

# Connect to backend container and test
docker exec -it your-backend-container-name bash
# Then inside backend container:
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://stockuser:stockpassword@postgres_db:5432/stockdb'
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Connection failed:', err);
  else console.log('Connection successful:', res.rows[0]);
  pool.end();
});
"
```

### Step 6: Verify Docker Network Configuration
```bash
# Check if containers are on the same network
docker network ls

# Check what network your containers are using
docker inspect postgres_db | grep NetworkMode
docker inspect your-backend-container-name | grep NetworkMode

# If they're not on the same network, create a custom network
docker network create stock-app-network

# Connect both containers to the network
docker network connect stock-app-network postgres_db
docker network connect stock-app-network your-backend-container-name

# Restart containers to apply network changes
docker restart postgres_db
docker restart your-backend-container-name
```

### Step 7: Update Backend Configuration Files
```bash
# Create or update your backend database configuration
# Example for Node.js/Express backend:

# Update your database connection file (usually in config/ or db/)
# Replace connection string with:
const connectionString = process.env.DATABASE_URL || 'postgresql://stockuser:stockpassword@postgres_db:5432/stockdb';
```

## Complete Docker Container Discovery and Network Analysis

### Step 1: SSH into Your Hostinger VPS
```bash
# From your local Git Bash terminal, connect to your VPS
ssh root@your-hostinger-vps-ip
# Replace 'your-hostinger-vps-ip' with your actual VPS IP address

# Once connected, navigate to your project directory (if applicable)
cd /path/to/your/project
# or stay in home directory: cd ~
```

### Step 2: Discover All Docker Containers
```bash
# Run these commands from your VPS terminal (after SSH connection)

# List all running containers with names, ports, and status
docker ps

# List all containers (running and stopped) with more details
docker ps -a

# Get detailed information about all containers
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}\t{{.Networks}}"

# List only container names
docker ps --format "{{.Names}}"

# Show container IDs and names
docker ps --format "{{.ID}}\t{{.Names}}"
```

### Step 3: Check Container Port Mappings
```bash
# Check port mappings for all running containers
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Check specific container port mappings
docker port container-name

# Example: If you have containers named frontend, backend, postgres_db
docker port frontend
docker port backend  
docker port postgres_db

# Alternative: Check all ports for all containers
for container in $(docker ps --format "{{.Names}}"); do
    echo "=== $container ==="
    docker port $container
    echo ""
done
```

### Step 4: Discover Docker Networks
```bash
# List all Docker networks
docker network ls

# Get detailed information about default bridge network
docker network inspect bridge

# Check which containers are on which networks
docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"

# For each network, see connected containers
for network in $(docker network ls --format "{{.Name}}"); do
    echo "=== Network: $network ==="
    docker network inspect $network --format '{{range .Containers}}{{.Name}} {{end}}'
    echo ""
done
```

### Step 5: Check Container Network Configuration
```bash
# Inspect specific containers for network details
docker inspect container-name --format '{{.NetworkSettings.Networks}}'

# Get IP addresses of all containers
docker inspect $(docker ps -q) --format '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'

# More detailed network info for each container
for container in $(docker ps --format "{{.Names}}"); do
    echo "=== $container Network Info ==="
    docker inspect $container --format '{{json .NetworkSettings.Networks}}' | jq '.'
    echo ""
done
```

### Step 6: Test Container-to-Container Connectivity
```bash
# Test if containers can reach each other by name
# Example: Test from backend container to postgres_db container

# Method 1: Using ping (if available in container)
docker exec -it backend-container-name ping postgres_db

# Method 2: Using telnet to test port connectivity
docker exec -it backend-container-name telnet postgres_db 5432

# Method 3: Using nc (netcat) to test port connectivity
docker exec -it backend-container-name nc -zv postgres_db 5432

# Method 4: Test database connection specifically
docker exec -it backend-container-name psql postgresql://stockuser:stockpassword@postgres_db:5432/stockdb -c "\l"
```

### Step 7: Container Addressing Rules
```bash
# How containers reference each other depends on network configuration:

# SAME NETWORK (recommended):
# - Use container name as hostname
# - Format: container-name:port
# Examples:
# - postgres_db:5432 (for database)
# - backend-container:7130 (for backend API)
# - frontend-container:80 (for frontend)

# DIFFERENT NETWORKS or HOST NETWORK:
# - Use VPS IP address
# - Format: vps-ip:exposed-port
# Examples:
# - your-vps-ip:5432 (if PostgreSQL port is exposed)
# - your-vps-ip:7130 (if backend port is exposed)
# - your-vps-ip:80 (if frontend port is exposed)
```

### Step 8: Create Unified Network (If Needed)
```bash
# If containers are not on the same network, create a custom network
docker network create stock-management-network

# Connect all your containers to this network
docker network connect stock-management-network frontend-container-name
docker network connect stock-management-network backend-container-name
docker network connect stock-management-network postgres_db

# Verify all containers are on the same network
docker network inspect stock-management-network --format '{{json .Containers}}' | jq '.'

# Restart containers to ensure network changes take effect
docker restart frontend-container-name
docker restart backend-container-name
docker restart postgres_db
```

### Step 9: Comprehensive Discovery Script
```bash
# Create a script to get all information at once
cat > docker-discovery.sh << 'EOF'
#!/bin/bash
echo "=== DOCKER CONTAINER DISCOVERY ==="
echo ""

echo "1. All Running Containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
echo ""

echo "2. Container Port Mappings:"
for container in $(docker ps --format "{{.Names}}"); do
    echo "--- $container ---"
    docker port $container
    echo ""
done

echo "3. Docker Networks:"
docker network ls
echo ""

echo "4. Container Network Assignments:"
for container in $(docker ps --format "{{.Names}}"); do
    echo "--- $container ---"
    docker inspect $container --format '{{range $net, $conf := .NetworkSettings.Networks}}Network: {{$net}}, IP: {{$conf.IPAddress}}{{end}}'
    echo ""
done

echo "5. Container Internal IPs:"
docker inspect $(docker ps -q) --format '{{.Name}} - {{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
echo ""

echo "=== CONNECTIVITY MATRIX ==="
echo "Container Name -> How to Reference from Other Containers"
for container in $(docker ps --format "{{.Names}}"); do
    ports=$(docker port $container | head -1 | cut -d':' -f2 | cut -d'-' -f1)
    echo "$container -> $container:$ports (if on same network) OR $(hostname -I | awk '{print $1}'):$ports (if different networks)"
done
EOF

chmod +x docker-discovery.sh
./docker-discovery.sh
```

### Step 10: Connection String Examples Based on Your Setup
```bash
# After running the discovery commands, update your connection strings:

# IF ALL CONTAINERS ARE ON SAME NETWORK:
# Backend connects to PostgreSQL:
DATABASE_URL=postgresql://stockuser:stockpassword@postgres_db:5432/stockdb

# Frontend connects to Backend:
API_BASE_URL=http://backend-container-name:7130

# IF CONTAINERS ARE ON DIFFERENT NETWORKS:
# Backend connects to PostgreSQL:
DATABASE_URL=postgresql://stockuser:stockpassword@YOUR_VPS_IP:5432/stockdb

# Frontend connects to Backend:
API_BASE_URL=http://YOUR_VPS_IP:7130
```

## YOUR ACTUAL DOCKER CONFIGURATION ANALYSIS

### Container Information Discovered:
```bash
# Your containers and their details:
Container Name: stock-frontend
- Image: stockmanagement_deploy_frontend
- Internal IP: 172.18.0.4
- Port Mapping: 0.0.0.0:8080->80/tcp
- Network: stockmanagement_deploy_default
- Status: Up 12 hours

Container Name: stock-backend
- Image: stockmanagement_deploy_backend  
- Internal IP: 172.18.0.3
- Port Mapping: 0.0.0.0:7130->7130/tcp
- Network: stockmanagement_deploy_default
- Status: Up 12 hours

Container Name: postgres_db
- Image: postgres:15
- Internal IP: 172.18.0.2
- Port Mapping: 0.0.0.0:5432->5432/tcp
- Network: stockmanagement_deploy_default
- Status: Up 12 hours
- Database: stockdb
- Username: stockuser
- Password: stockpassword
```

### Network Configuration:
```bash
# All containers are on the SAME network: stockmanagement_deploy_default
# Network Type: bridge
# Gateway: 172.18.0.1
# Network ID: aa8a03e80f44079b9fe0eefdf74a5caeaac9586a139a96b9e6e37fae4d9c2768

# Container connectivity test PASSED:
# stock-backend can reach postgres_db on port 5432 ✓
```

### Your Exact Connection Strings:

**Backend to PostgreSQL Database:**
```bash
# Use container name (RECOMMENDED - since all on same network):
DATABASE_URL=postgresql://stockuser:stockpassword@postgres_db:5432/stockdb

# Alternative using IP address:
DATABASE_URL=postgresql://stockuser:stockpassword@172.18.0.2:5432/stockdb

# External access (from outside Docker network):
DATABASE_URL=postgresql://stockuser:stockpassword@YOUR_VPS_IP:5432/stockdb
```

**Frontend to Backend API:**
```bash
# From within Docker network:
API_BASE_URL=http://stock-backend:7130

# From external access (browser/outside Docker):
API_BASE_URL=http://YOUR_VPS_IP:7130
```

**External Access URLs:**
```bash
# Frontend (from browser):
http://YOUR_VPS_IP:8080

# Backend API (from browser/external apps):
http://YOUR_VPS_IP:7130

# PostgreSQL (from external database clients):
postgresql://stockuser:stockpassword@YOUR_VPS_IP:5432/stockdb
```

### Container-to-Container Communication Rules:
```bash
# Since ALL your containers are on stockmanagement_deploy_default network:

# ✅ Backend → Database:
# Use: postgres_db:5432 or 172.18.0.2:5432

# ✅ Frontend → Backend (if frontend makes server-side calls):  
# Use: stock-backend:7130 or 172.18.0.3:7130

# ✅ Any container → Any container:
# Use container name as hostname (Docker DNS resolution)
```

### Recommended Configuration Updates:

**Update your backend .env file:**
```bash
# Your backend should use (already updated in your .env):
DATABASE_URL=postgresql://stockuser:stockpassword@postgres_db:5432/stockdb
PORT=7130
```

**Update your frontend API configuration:**
```bash
# In your frontend api.ts file, for production:
const API_BASE_URL = 'http://YOUR_VPS_IP:7130/';

# The frontend runs in browser, so it needs external access
# Your current setting should be:
const API_BASE_URL = 'https://stock-app-management.nebo.co.tz:7130/';
```

### Verification Commands:
```bash
# Test database connection from backend:
docker exec -it stock-backend psql postgresql://stockuser:stockpassword@postgres_db:5432/stockdb -c "\l"

# Test backend API from frontend container:
docker exec -it stock-frontend curl http://stock-backend:7130/health

# Test all connections:
docker exec -it stock-backend nc -zv postgres_db 5432
docker exec -it stock-frontend nc -zv stock-backend 7130
```
