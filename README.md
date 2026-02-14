# Accounting System with Role-Based Authentication

A full-stack personal accounting system with role-based access control built using React (Vite), Node.js/Express, and MongoDB.

## Features

### User Roles
- **Master Admin**: Full system access, user management, audit logs, system settings
- **User**: Can create vouchers, view dashboard and reports (max 3 users)

### Security
- JWT-based authentication
- Bcrypt password hashing
- Role-based middleware protection
- Audit logging for all actions
- Input validation

## Project Structure

```
├── backend/                 # Express.js API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth, role, validation middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility scripts (seed)
│   ├── .env                # Environment variables
│   ├── package.json
│   └── server.js           # Entry point
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── common/     # Shared components
│   │   │   └── pages/      # Page components
│   │   ├── context/        # Auth context
│   │   └── services/       # API services
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── desktop/                # Electron app (placeholder)
```

## Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/accounting_system
JWT_SECRET=your_super_secret_key
```

Seed the database:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Default Login Credentials

### Master Admin
- **Email**: admin@example.com
- **Password**: admin123

### Users
- **User 1**: user1@example.com / user123
- **User 2**: user2@example.com / user123
- **User 3**: user3@example.com / user123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create user (Master Admin only)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/change-password` - Change password

### Admin (Master Admin only)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/activate` - Activate user
- `PUT /api/admin/users/:id/deactivate` - Deactivate user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/reset-password` - Reset password
- `GET /api/admin/audit-logs` - View audit logs

### Transactions (All authenticated users)
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update own transaction
- `DELETE /api/transactions/:id` - Delete own transaction

### Ledgers (All authenticated users)
- `GET /api/ledgers` - List ledgers
- `POST /api/ledgers` - Create ledger
- `PUT /api/ledgers/:id` - Update ledger
- `DELETE /api/ledgers/:id` - Delete ledger (Master Admin only)

## Database Schema

### User
- name, email, password (hashed)
- role: master_admin | user
- isActive, createdAt, lastLogin

### Transaction
- date, voucherNumber
- debitLedger, creditLedger
- amount, narration, type
- createdBy, isDeleted

### Ledger
- name, type, balance
- createdBy, isActive

### AuditLog
- action, userId, userRole
- targetId, details, timestamp

## Security Features

1. **JWT Authentication**: Tokens expire after 24 hours
2. **Password Hashing**: Bcrypt with 12 salt rounds
3. **Role Validation**: Middleware checks on all protected routes
4. **Input Validation**: Express-validator for all inputs
5. **Audit Trail**: All actions logged with user info
6. **Soft Deletes**: Transactions are soft-deleted, not removed
7. **User Limits**: Maximum 3 normal users enforced

## License

MIT
