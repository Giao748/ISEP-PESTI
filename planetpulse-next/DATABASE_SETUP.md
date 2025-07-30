# PlanetPulse Database Setup

This document explains how to set up and connect the MariaDB database for the PlanetPulse application.

## Prerequisites

1. **MariaDB or MySQL** installed and running
2. **Node.js** and **npm** installed
3. **Database credentials** with CREATE privileges

## Quick Setup

### 1. Environment Configuration

Create a `.env.local` file in the `planetpulse-next` directory:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=PlanetPulse
DB_PORT=3306

# Security
JWT_SECRET=your-super-secret-jwt-key-here
BCRYPT_ROUNDS=12

# GDPR Compliance
DATA_RETENTION_DAYS=2555  # 7 years for legal compliance
CONSENT_REQUIRED=true
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Database

```bash
npm run setup-db
```

This script will:
- Create the `PlanetPulse` database if it doesn't exist
- Create required tables with GDPR compliance
- Set up proper indexes for performance
- Display database status

### 4. Test Connection

Start the development server:

```bash
npm run dev
```

Test the database connection by visiting:
```
GET http://localhost:3000/api/db-test
```

## Database Schema

### Users Table

The `users` table stores user account information with GDPR compliance:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Validator', 'Member', 'Partner') DEFAULT 'Member',
  name VARCHAR(255) NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  consent_given BOOLEAN DEFAULT FALSE,
  data_processing_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  data_retention_until DATE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  -- Indexes for performance
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
);
```

### User Audit Log Table

The `user_audit_log` table tracks user actions for GDPR compliance:

```sql
CREATE TABLE user_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  -- Indexes for performance
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

## API Endpoints

### User Registration

**POST** `/api/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "nationality": "Portuguese",
  "role": "Member",
  "consent": {
    "data_processing": true,
    "marketing": false
  }
}
```

### User Login

**POST** `/api/login`

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Database Test

**GET** `/api/db-test`

Returns database connection status and table information.

## GDPR Compliance Features

### Data Protection
- **Consent Tracking**: Users must explicitly consent to data processing
- **Audit Logging**: All user actions are logged for transparency
- **Data Retention**: Automatic data retention period tracking
- **Right to be Forgotten**: User accounts can be deactivated
- **Secure Storage**: Passwords are hashed using bcrypt

### Consent Management
- **Required Consent**: Data processing consent is mandatory for registration
- **Optional Consent**: Marketing consent is optional and can be withdrawn
- **Granular Control**: Different types of consent are tracked separately

### Security Features
- **Password Hashing**: bcrypt with configurable rounds (default: 12)
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Email format, password strength validation
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Built-in protection against abuse

## User Roles

- **Member**: Standard user with basic access
- **Validator**: Can validate content and submissions
- **Partner**: Partner organization representative
- **Admin**: Full system administration access

## Troubleshooting

### Common Issues

1. **Connection refused**
   - Ensure MariaDB/MySQL is running
   - Check host and port configuration
   - Verify firewall settings

2. **Access denied**
   - Check username and password
   - Ensure user has necessary privileges
   - Verify database exists

3. **Table creation fails**
   - Check user has CREATE privileges
   - Verify database character set support
   - Check for conflicting table names

### Debug Mode

Set environment variable for detailed logging:
```bash
DEBUG=true npm run dev
```

### Manual Database Setup

If the automated setup fails, you can manually create the database:

```sql
CREATE DATABASE PlanetPulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE PlanetPulse;
-- Run the table creation statements from the schema section above
```

## Development

### Adding New Tables

1. Update `lib/database.ts` with new table creation SQL
2. Run `npm run setup-db` to apply changes
3. Update API endpoints as needed

### Migration Strategy

For production deployments:
1. Create migration scripts in `scripts/migrations/`
2. Version control schema changes
3. Test migrations on staging environment first

## Production Considerations

1. **Environment Variables**: Use secure secret management
2. **Connection Pooling**: Configured automatically
3. **SSL/TLS**: Enable for production database connections
4. **Backup Strategy**: Implement regular database backups
5. **Monitoring**: Set up database performance monitoring

## Support

For database-related issues:
1. Check the troubleshooting section above
2. Review application logs
3. Test database connection independently
4. Verify environment configuration