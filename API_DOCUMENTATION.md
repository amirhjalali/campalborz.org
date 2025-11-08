# API Documentation

This document provides complete API reference for the Camp Alborz platform backend.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://www.campalborz.org/api`

## Authentication

Currently, most endpoints are public. Protected endpoints (when implemented) will require:

```
Authorization: Bearer <token>
```

## Response Format

All API responses follow this standard format:

### Success Response

```json
{
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Payments & Donations

### Create Payment Intent

Creates a Stripe Payment Intent for processing donations.

**Endpoint:** `POST /api/create-payment-intent`

**Request Body:**

```json
{
  "amount": 5000,           // Amount in cents (required)
  "donationType": "one-time",  // "one-time" or "recurring" (optional)
  "currency": "usd",        // Currency code (optional, default: "usd")
  "metadata": {             // Additional data (optional)
    "donorName": "John Doe",
    "donorEmail": "john@example.com",
    "campaign": "Burning Man 2024",
    "message": "Keep up the great work!"
  }
}
```

**Response:**

```json
{
  "clientSecret": "pi_xxx_secret_yyy",
  "message": "Demo mode - real Stripe integration not configured"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid amount (minimum $1.00)
- `500 Internal Server Error` - Payment intent creation failed

**Example:**

```typescript
const response = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: 5000, // $50.00
    donationType: 'one-time',
    metadata: {
      donorName: 'Jane Smith',
      donorEmail: 'jane@example.com',
    },
  }),
});

const { clientSecret } = await response.json();
```

**Notes:**

- Amount must be in cents (e.g., $50.00 = 5000)
- Minimum amount is $1.00 (100 cents)
- Currently returns mock data for development
- See STRIPE_SETUP.md for production configuration

---

### Stripe Webhook Handler

Receives and processes webhook events from Stripe.

**Endpoint:** `POST /api/webhooks/stripe`

**Headers:**

```
stripe-signature: t=xxx,v1=yyy
```

**Supported Events:**

- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.created` - Payment intent created
- `charge.succeeded` - Charge completed
- `customer.subscription.created` - Recurring donation started
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription canceled

**Response:**

```json
{
  "received": true
}
```

**Example Webhook Event:**

```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "amount": 5000,
      "currency": "usd",
      "metadata": {
        "donorName": "John Doe",
        "donorEmail": "john@example.com",
        "campaign": "Burning Man 2024"
      }
    }
  }
}
```

**Notes:**

- This endpoint is called automatically by Stripe
- Signature verification is required in production
- Webhook secret must be configured in environment variables
- See STRIPE_SETUP.md for webhook configuration

---

## Members (Future)

### Get Member Profile

**Endpoint:** `GET /api/members/{memberId}`

**Authentication:** Required

**Response:**

```json
{
  "id": "member_xxx",
  "name": "John Doe",
  "email": "john@example.com",
  "joinDate": "2024-01-01T00:00:00.000Z",
  "status": "active",
  "role": "member"
}
```

### Create Member Application

**Endpoint:** `POST /api/members/apply`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "whyJoin": "I want to contribute...",
  "skills": ["art", "carpentry"],
  "experience": "First-time burner"
}
```

### Update Member Profile

**Endpoint:** `PATCH /api/members/{memberId}`

**Authentication:** Required

**Request Body:**

```json
{
  "bio": "Updated bio",
  "skills": ["art", "cooking"],
  "avatar": "https://..."
}
```

---

## Volunteers (Future)

### Submit Volunteer Application

**Endpoint:** `POST /api/volunteers/apply`

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "availability": {
    "weekdays": true,
    "weekends": true,
    "evenings": false
  },
  "interests": ["setup", "cooking", "art"],
  "experience": "3 years volunteering",
  "skills": ["carpentry", "electrical"]
}
```

### Get Volunteer Opportunities

**Endpoint:** `GET /api/volunteers/opportunities`

**Query Parameters:**

- `type` - Filter by opportunity type
- `date` - Filter by date
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset

**Response:**

```json
{
  "opportunities": [
    {
      "id": "opp_xxx",
      "title": "Setup Crew",
      "description": "Help set up camp structures",
      "date": "2024-08-20",
      "spotsAvailable": 5,
      "requirements": ["Physical fitness"]
    }
  ],
  "total": 15,
  "hasMore": true
}
```

---

## Events (Future)

### Get Events

**Endpoint:** `GET /api/events`

**Query Parameters:**

- `status` - Filter by status (upcoming, past, all)
- `category` - Filter by category
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset

**Response:**

```json
{
  "events": [
    {
      "id": "evt_xxx",
      "title": "Burning Man 2024",
      "description": "Annual gathering...",
      "startDate": "2024-08-25T00:00:00.000Z",
      "endDate": "2024-09-02T00:00:00.000Z",
      "location": "Black Rock City, NV",
      "capacity": 100,
      "registered": 75,
      "image": "https://..."
    }
  ],
  "total": 12,
  "hasMore": false
}
```

### Register for Event

**Endpoint:** `POST /api/events/{eventId}/register`

**Authentication:** Required

**Request Body:**

```json
{
  "attendeeInfo": {
    "dietaryRestrictions": "Vegetarian",
    "emergencyContact": "+1234567890",
    "notes": "Arriving Friday"
  }
}
```

---

## Contact (Future)

### Submit Contact Form

**Endpoint:** `POST /api/contact/submit`

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "General Inquiry",
  "message": "I have a question about..."
}
```

**Response:**

```json
{
  "id": "msg_xxx",
  "status": "received",
  "message": "We'll respond within 24-48 hours"
}
```

---

## Newsletter (Future)

### Subscribe to Newsletter

**Endpoint:** `POST /api/newsletter/subscribe`

**Request Body:**

```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "interests": ["events", "workshops"]
}
```

**Response:**

```json
{
  "subscribed": true,
  "message": "Welcome to our newsletter!"
}
```

### Unsubscribe from Newsletter

**Endpoint:** `POST /api/newsletter/unsubscribe`

**Request Body:**

```json
{
  "email": "john@example.com",
  "token": "unsubscribe_token_xxx"
}
```

---

## Analytics (Future)

### Track Event

**Endpoint:** `POST /api/analytics/track`

**Request Body:**

```json
{
  "event": "button_click",
  "category": "engagement",
  "properties": {
    "button": "donate",
    "page": "/",
    "value": 50
  },
  "sessionId": "session_xxx",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com"
}
```

**Response:**

```json
{
  "tracked": true
}
```

---

## Rate Limiting

All endpoints are rate-limited to prevent abuse:

- **Anonymous users**: 60 requests per minute
- **Authenticated users**: 300 requests per minute
- **Webhook endpoints**: No rate limit

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1609459200
```

When rate limit is exceeded:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 30
}
```

---

## Webhooks (Future)

### Webhook Delivery

Webhook payloads are sent as POST requests with this format:

```json
{
  "event": "donation.created",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "id": "don_xxx",
    "amount": 5000,
    "donor": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Webhook Signatures

All webhooks include a signature header for verification:

```
X-Webhook-Signature: sha256=xxx
```

Verify signatures using:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication required or failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `DUPLICATE_RESOURCE` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `PAYMENT_ERROR` | Payment processing failed |
| `EXTERNAL_SERVICE_ERROR` | External service (Stripe, email) failed |
| `DATABASE_ERROR` | Database operation failed |
| `INTERNAL_ERROR` | Unexpected server error |

---

## Pagination

List endpoints support pagination:

**Query Parameters:**

- `limit` - Number of results per page (default: 20, max: 100)
- `offset` - Number of results to skip
- `cursor` - Cursor for cursor-based pagination (alternative to offset)

**Response:**

```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "hasMore": true,
    "nextCursor": "cursor_xxx"
  }
}
```

---

## Filtering & Sorting

List endpoints support filtering and sorting:

**Query Parameters:**

- `filter[field]=value` - Filter by field value
- `filter[field][operator]=value` - Filter with operator
- `sort=field` - Sort by field (ascending)
- `sort=-field` - Sort by field (descending)

**Operators:**

- `eq` - Equal
- `ne` - Not equal
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `in` - In array
- `contains` - Contains string

**Example:**

```
GET /api/events?filter[status]=upcoming&sort=-startDate&limit=10
```

---

## SDK / Client Libraries

### TypeScript/JavaScript

```typescript
import { CampAlborzAPI } from '@campalborz/api-client';

const client = new CampAlborzAPI({
  baseURL: 'https://www.campalborz.org/api',
  apiKey: 'your_api_key',
});

// Create payment intent
const { clientSecret } = await client.payments.createIntent({
  amount: 5000,
  donationType: 'one-time',
});

// Get events
const events = await client.events.list({
  status: 'upcoming',
  limit: 10,
});
```

### Python (Future)

```python
from campalborz import Client

client = Client(api_key='your_api_key')

# Create payment intent
intent = client.payments.create_intent(
    amount=5000,
    donation_type='one-time'
)

# Get events
events = client.events.list(status='upcoming', limit=10)
```

---

## Testing

### Test API Keys

Use these test credentials in development:

```
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx
```

### Mock Data

All endpoints return mock data in development mode when:
- Stripe is not configured
- Database is not connected
- External services are unavailable

### Postman Collection

Import our Postman collection for easy API testing:

```bash
https://www.campalborz.org/api/postman-collection.json
```

---

## Versioning

API versioning is handled through the URL path:

- `v1` (current): `/api/v1/...`
- `v2` (future): `/api/v2/...`

Legacy versions are maintained for 12 months after deprecation.

---

## Support

For API support:
- Email: developers@campalborz.org
- Discord: #api-support
- GitHub Issues: https://github.com/campalborz/issues

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Payment intent creation
- Stripe webhook handling
- Basic donation processing

### Future Releases
- Member management endpoints
- Event registration API
- Volunteer management
- Content management
- File uploads
- Real-time WebSocket support

---

## Security

### Best Practices

1. **Always use HTTPS** in production
2. **Never expose API keys** in client-side code
3. **Validate webhook signatures** from Stripe
4. **Implement rate limiting** on all endpoints
5. **Sanitize user input** to prevent injection attacks
6. **Use environment variables** for sensitive config
7. **Log security events** for audit trails

### Reporting Security Issues

Report security vulnerabilities to: security@campalborz.org

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

We aim to respond within 24 hours.
