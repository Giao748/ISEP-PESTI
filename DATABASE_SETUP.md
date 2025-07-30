# PlanetPulse Database Setup Guide

This guide explains how to set up and connect the MariaDB database for PlanetPulse with GDPR compliance.

## Prerequisites

- MariaDB or MySQL 8.0+
- Node.js 18+
- A running database server

## Database Setup

### 1. Install MariaDB

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mariadb-server
sudo mysql_secure_installation
```

#### Windows:
Download and install from [MariaDB Downloads](https://mariadb.org/download/)

#### macOS:
```bash
brew install mariadb
brew services start mariadb
```

### 2. Create Database and User

Connect to MariaDB as root:
```bash
sudo mysql -u root -p
```

Run the following SQL commands:
```sql
-- Create database
CREATE DATABASE PlanetPulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user for the application
CREATE USER 'planetpulse'@'localhost' IDENTIFIED BY 'your_secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON PlanetPulse.* TO 'planetpulse'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### 3. Import Database Schema

Import the GDPR-compliant database schema:
```bash
mysql -u planetpulse -p PlanetPulse < PlanetPulse.sql
```

### 4. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=planetpulse
DB_PASSWORD=your_secure_password_here
DB_NAME=PlanetPulse
DB_PORT=3306

# Security (Generate a secure 32-character key)
ENCRYPTION_SECRET=your_32_character_encryption_key_here

# GDPR Configuration
PRIVACY_POLICY_URL=/privacy-policy
COOKIE_CONSENT_DURATION=365
DATA_RETENTION_DAYS=2555
```

### 5. Generate Encryption Secret

Generate a secure 32-character encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## GDPR Compliance Features

### Data Protection Measures

1. **Password Security**: Uses PBKDF2 with SHA-512 hashing
2. **Data Encryption**: Sensitive data encrypted using AES-256-CBC
3. **Access Logging**: All data operations logged for audit trails
4. **Consent Management**: Explicit consent tracking and history
5. **Data Minimization**: Only necessary data is collected

### User Rights Implementation

- **Right of Access (Article 15)**: Data export API endpoint
- **Right to Rectification (Article 16)**: Profile update functionality
- **Right to Erasure (Article 17)**: Account deletion with data cleanup
- **Right to Data Portability (Article 20)**: JSON export of user data
- **Right to Object (Article 21)**: Consent withdrawal options

### Database Tables

- `users`: Core user accounts with GDPR consent fields
- `members`: Extended profile information
- `gdpr_processing_log`: Audit trail of all data processing
- `user_consent_history`: Consent changes tracking
- `data_export_requests`: Article 20 compliance
- `data_deletion_requests`: Article 17 compliance
- `data_breach_log`: Article 33/34 compliance

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up the database (follow steps above)

3. Run the development server:
```bash
npm run dev
```

4. Access the application at `http://localhost:3000`

## Production Deployment

### Security Checklist

- [ ] Use strong database passwords
- [ ] Enable SSL/TLS for database connections
- [ ] Configure firewall rules
- [ ] Set up regular database backups
- [ ] Enable audit logging
- [ ] Configure data retention policies
- [ ] Test data export/deletion procedures

### Environment Variables for Production

```env
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_strong_production_password
DB_NAME=PlanetPulse
DB_PORT=3306
ENCRYPTION_SECRET=your_secure_32_character_production_key
```

## GDPR Maintenance

### Regular Tasks

1. **Data Retention Cleanup**: Run the `CleanupExpiredData()` procedure monthly
2. **Consent Audits**: Review consent logs quarterly
3. **Security Reviews**: Conduct annual security assessments
4. **Backup Testing**: Test data recovery procedures regularly

### Compliance Monitoring

- Monitor processing logs for unusual activity
- Review consent withdrawal requests
- Audit data export/deletion fulfillment
- Track data breach incidents

## API Endpoints

### Registration
- `POST /api/register`: Create new user account with GDPR consent

### GDPR Compliance (Future Implementation)
- `GET /api/user/data-export`: Export user data
- `POST /api/user/data-deletion`: Request account deletion
- `PUT /api/user/consent`: Update consent preferences

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check MariaDB service status
2. **Access Denied**: Verify database credentials
3. **Table Not Found**: Import PlanetPulse.sql schema
4. **Encryption Errors**: Ensure ENCRYPTION_SECRET is exactly 32 characters

### Logs

Check application logs for database connection issues:
```bash
npm run dev
# Check console for database connection status
```

## Support

For technical support or GDPR compliance questions:
- Email: privacy@planetpulse.com
- Documentation: [Internal GDPR Documentation]
- Issue Tracker: [GitHub Issues]

## License

This project follows GDPR compliance guidelines and includes privacy by design principles.