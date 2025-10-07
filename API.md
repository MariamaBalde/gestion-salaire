# PayrollPro API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

### JWT Token
Include the JWT token in the Authorization header for all protected endpoints:
```
Authorization: Bearer <your-jwt-token>
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "motDePasse": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nom": "John Doe",
    "email": "user@example.com",
    "role": "ADMIN",
    "entrepriseId": 1
  }
}
```

## Users API

### Get All Users
```http
GET /users
Authorization: Bearer <token>
```

**Query Parameters:**
- `role` (optional): Filter by role
- `entrepriseId` (optional): Filter by enterprise

### Create User
```http
POST /users/inscription
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Jane Doe",
  "email": "jane@example.com",
  "motDePasse": "password123",
  "role": "CAISSIER",
  "entrepriseId": 1
}
```

### Update User
```http
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Jane Smith",
  "role": "ADMIN"
}
```

### Delete User
```http
DELETE /users/:id
Authorization: Bearer <token>
```

## Employees API

### Get All Employees
```http
GET /employees
Authorization: Bearer <token>
```

**Query Parameters:**
- `entrepriseId`: Filter by enterprise
- `actif`: Filter by status (true/false)
- `poste`: Filter by position
- `typeContrat`: Filter by contract type

### Create Employee
```http
POST /employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "nomComplet": "John Doe",
  "poste": "Développeur",
  "typeContrat": "FIXE",
  "tauxSalaire": 50000,
  "coordonneesBancaires": "IBAN: FR123456789",
  "entrepriseId": 1
}
```

### Update Employee
```http
PUT /employees/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "poste": "Senior Développeur",
  "tauxSalaire": 60000
}
```

### Toggle Employee Status
```http
PATCH /employees/:id/toggle-active
Authorization: Bearer <token>
```

### Generate Attendance List PDF
```http
GET /employees/attendance/pdf?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

## Pay Runs API

### Get All Pay Runs
```http
GET /payruns
Authorization: Bearer <token>
```

**Query Parameters:**
- `entrepriseId`: Filter by enterprise
- `status`: Filter by status (BROUILLON/APPROUVE/CLOTURE)

### Create Pay Run
```http
POST /payruns
Authorization: Bearer <token>
Content-Type: application/json

{
  "entrepriseId": 1,
  "type": "MENSUELLE",
  "dateDebut": "2024-01-01",
  "dateFin": "2024-01-31"
}
```

### Approve Pay Run
```http
PATCH /payruns/:id/approve
Authorization: Bearer <token>
```

### Close Pay Run
```http
PATCH /payruns/:id/close
Authorization: Bearer <token>
```

## Payslips API

### Get All Payslips
```http
GET /payslips
Authorization: Bearer <token>
```

**Query Parameters:**
- `payRunId`: Filter by pay run
- `employeeId`: Filter by employee
- `status`: Filter by status

### Update Payslip
```http
PUT /payslips/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "joursTravailles": 22,
  "deductions": 5000
}
```

### Generate Payslip PDF
```http
GET /payslips/:id/pdf
Authorization: Bearer <token>
```

**Response:** PDF file download

### Generate Bulk Payslips PDF
```http
GET /payslips/bulk/pdf?payRunId=1
Authorization: Bearer <token>
```

**Response:** PDF file download

## Payments API

### Get All Payments
```http
GET /payments
Authorization: Bearer <token>
```

**Query Parameters:**
- `payslipId`: Filter by payslip
- `entrepriseId`: Filter by enterprise

### Create Payment
```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "payslipId": 1,
  "montant": 45000,
  "modePaiement": "VIREMENT_BANCAIRE",
  "reference": "TR123456"
}
```

### Generate Payment Receipt PDF
```http
GET /payments/:id/receipt
Authorization: Bearer <token>
```

**Response:** PDF file download

### Generate Payment List PDF
```http
GET /payments/list/pdf?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response:** PDF file download

## Dashboard API

### Get Dashboard Data
```http
GET /dashboard/data
Authorization: Bearer <token>
```

**Response:**
```json
{
  "kpis": {
    "masseSalariale": 2500000,
    "montantPaye": 2250000,
    "montantRestant": 250000,
    "employesActifs": 45
  },
  "evolution": [
    {"month": "Jan", "masseSalariale": 2400000},
    {"month": "Fév", "masseSalariale": 2450000}
  ],
  "upcomingPayments": [
    {
      "employeeName": "John Doe",
      "montant": 50000,
      "dateEcheance": "2024-02-01"
    }
  ]
}
```

### Get Global Stats (Super Admin only)
```http
GET /dashboard/global-stats
Authorization: Bearer <token>
```

## Enterprises API

### Get All Enterprises
```http
GET /entreprises
Authorization: Bearer <token>
```

### Create Enterprise
```http
POST /entreprises
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "TechCorp",
  "adresse": "123 Tech Street",
  "devise": "XOF"
}
```

## Error Responses

### Common Error Format
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Data Models

### User
```typescript
{
  id: number;
  nom: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CAISSIER';
  entrepriseId?: number;
  actif: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Employee
```typescript
{
  id: number;
  nomComplet: string;
  poste: string;
  typeContrat: 'JOURNALIER' | 'FIXE' | 'HONORAIRE';
  tauxSalaire: number;
  coordonneesBancaires?: string;
  actif: boolean;
  entrepriseId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### PayRun
```typescript
{
  id: number;
  type: 'MENSUELLE' | 'HEBDOMADAIRE' | 'JOURNALIERE';
  dateDebut: Date;
  dateFin: Date;
  status: 'BROUILLON' | 'APPROUVE' | 'CLOTURE';
  entrepriseId: number;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Payslip
```typescript
{
  id: number;
  employeeId: number;
  payRunId: number;
  joursTravailles?: number;
  deductions: number;
  net: number;
  status: 'ATTENTE' | 'PARTIEL' | 'PAYE';
  createdAt: Date;
  updatedAt: Date;
}
```

### Payment
```typescript
{
  id: number;
  payslipId: number;
  montant: number;
  modePaiement: 'ESPECES' | 'VIREMENT_BANCAIRE' | 'ORANGE_MONEY' | 'WAVE';
  reference?: string;
  datePaiement: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Rate Limiting

- API requests are limited to prevent abuse
- Standard limits: 100 requests per 15 minutes per IP
- Authenticated users have higher limits

## File Uploads

### Supported Formats
- Images: PNG, JPG, JPEG (max 5MB)
- Documents: PDF (max 10MB)

### Upload Directory
```
backend/uploads/
├── logos/     # Enterprise logos
└── documents/ # Generated PDFs