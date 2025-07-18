# Security Best Practices

## Environment Variables and Secrets

This project uses sensitive configuration data that should never be committed to version control. Follow these guidelines:

### 1. Configuration Files

- **`appsettings.json`** - Contains database connection strings and JWT secrets
- **Never commit this file with real credentials**
- Use `appsettings.template.json` as a reference for the required structure
- Copy `appsettings.template.json` to `appsettings.json` and fill in your actual values

### 2. Database Connection Setup

1. Copy the template file:
   ```bash
   cp appsettings.template.json appsettings.json
   ```

2. Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=your-actual-host;Port=25060;Database=defaultdb;Username=your-username;Password=your-actual-password;SSL Mode=Require"
     }
   }
   ```

### 3. Files Protected by .gitignore

The following files are automatically ignored by git:
- `appsettings.json`
- `appsettings.*.json`
- `.env*` files
- `*.key`, `*.pem`, `*.crt` files
- Database files

### 4. What to Do if You Accidentally Commit Secrets

1. **Immediately rotate/change the exposed credentials**
2. **Remove the secrets from git history**
3. **Update all systems using the old credentials**

### 5. GitHub Push Protection

This repository has GitHub's secret scanning enabled, which will block pushes containing:
- Database passwords
- API keys
- Private keys
- Other sensitive tokens

If you encounter a push protection error:
1. Remove the sensitive data from your files
2. Replace with placeholder values
3. Commit and push the cleaned version

### 6. Development Environment

For local development:
1. Never use production credentials in development
2. Use local database instances when possible
3. Create separate development/staging environments
4. Use environment-specific configuration files

## Emergency Contact

If you suspect credentials have been compromised:
1. Immediately change all affected passwords/keys
2. Review access logs for unauthorized usage
3. Update all applications using the compromised credentials
