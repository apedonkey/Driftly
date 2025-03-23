# Driftly API Documentation

## Overview

Driftly is a tool for setting up email nurture flows simply. This backend API provides all the functionality needed to manage users, email flows, contacts, and billing.

## Base URL

```
https://api.driftly.com/api
```

## Authentication

Driftly uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header for all protected endpoints:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Endpoints

#### Register a new user

```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "activeSubscription": false,
    "activeFlows": 0,
    "createdAt": "2025-03-21T11:00:00.000Z"
  }
}
```

#### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "activeSubscription": false,
    "activeFlows": 0,
    "createdAt": "2025-03-21T11:00:00.000Z"
  }
}
```

#### Get current user

```
GET /auth/me
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "activeSubscription": false,
    "activeFlows": 0,
    "createdAt": "2025-03-21T11:00:00.000Z"
  }
}
```

#### Forgot Password

```
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### Reset Password

```
PUT /auth/reset-password/:resettoken
```

**Request Body:**
```json
{
  "password": "newpassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "message": "Password reset successful"
}
```

## Flow Management

### Flow Endpoints

#### Create a new flow

```
POST /flows
```

**Request Body:**
```json
{
  "name": "Welcome Sequence",
  "description": "A series of welcome emails for new users",
  "steps": [
    {
      "order": 0,
      "subject": "Welcome to our service!",
      "body": "<p>Hi {{firstName}},</p><p>Welcome to our service!</p>",
      "delayDays": 0,
      "delayHours": 0
    },
    {
      "order": 1,
      "subject": "Getting started guide",
      "body": "<p>Hi {{firstName}},</p><p>Here's how to get started...</p>",
      "delayDays": 2,
      "delayHours": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "flow_id",
    "name": "Welcome Sequence",
    "description": "A series of welcome emails for new users",
    "isActive": false,
    "steps": [...],
    "stats": {
      "totalContacts": 0,
      "emailsSent": 0,
      "opens": 0,
      "clicks": 0
    },
    "user": "user_id",
    "createdAt": "2025-03-21T11:00:00.000Z",
    "updatedAt": "2025-03-21T11:00:00.000Z"
  }
}
```

#### Get all flows

```
GET /flows
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "flow_id",
      "name": "Welcome Sequence",
      "description": "A series of welcome emails for new users",
      "isActive": false,
      "steps": [...],
      "stats": {
        "totalContacts": 0,
        "emailsSent": 0,
        "opens": 0,
        "clicks": 0
      },
      "user": "user_id",
      "createdAt": "2025-03-21T11:00:00.000Z",
      "updatedAt": "2025-03-21T11:00:00.000Z"
    }
  ]
}
```

#### Get a specific flow

```
GET /flows/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "flow_id",
    "name": "Welcome Sequence",
    "description": "A series of welcome emails for new users",
    "isActive": false,
    "steps": [...],
    "stats": {
      "totalContacts": 0,
      "emailsSent": 0,
      "opens": 0,
      "clicks": 0
    },
    "user": "user_id",
    "createdAt": "2025-03-21T11:00:00.000Z",
    "updatedAt": "2025-03-21T11:00:00.000Z"
  }
}
```

#### Update a flow

```
PUT /flows/:id
```

**Request Body:**
```json
{
  "name": "Updated Welcome Sequence",
  "description": "An updated series of welcome emails"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "flow_id",
    "name": "Updated Welcome Sequence",
    "description": "An updated series of welcome emails",
    "isActive": false,
    "steps": [...],
    "stats": {
      "totalContacts": 0,
      "emailsSent": 0,
      "opens": 0,
      "clicks": 0
    },
    "user": "user_id",
    "createdAt": "2025-03-21T11:00:00.000Z",
    "updatedAt": "2025-03-21T11:00:00.000Z"
  }
}
```

#### Delete a flow

```
DELETE /flows/:id
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

#### Activate a flow

```
PUT /flows/:id/activate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "flow_id",
    "name": "Welcome Sequence",
    "isActive": true,
    ...
  }
}
```

#### Deactivate a flow

```
PUT /flows/:id/deactivate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "flow_id",
    "name": "Welcome Sequence",
    "isActive": false,
    ...
  }
}
```

#### Update flow steps

```
PUT /flows/:id/steps
```

**Request Body:**
```json
{
  "steps": [
    {
      "order": 0,
      "subject": "Welcome to our service!",
      "body": "<p>Hi {{firstName}},</p><p>Welcome to our service!</p>",
      "delayDays": 0,
      "delayHours": 0
    },
    {
      "order": 1,
      "subject": "Getting started guide",
      "body": "<p>Hi {{firstName}},</p><p>Here's how to get started...</p>",
      "delayDays": 2,
      "delayHours": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "flow_id",
    "name": "Welcome Sequence",
    "steps": [...],
    ...
  }
}
```

#### Get flow analytics

```
GET /flows/:id/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContacts": 100,
    "emailsSent": 250,
    "opens": 150,
    "clicks": 75,
    "openRate": "60.00",
    "clickRate": "50.00",
    "status": "active",
    "createdAt": "2025-03-21T11:00:00.000Z",
    "updatedAt": "2025-03-21T11:00:00.000Z"
  }
}
```

### Contact Management

#### Add contacts to a flow

```
POST /flows/:flowId/contacts
```

**Request Body:**
```json
{
  "contacts": [
    {
      "email": "contact1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "metadata": {
        "company": "Acme Inc",
        "role": "Manager"
      }
    },
    {
      "email": "contact2@example.com",
      "firstName": "Jane",
      "lastName": "Smith"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "message": "2 contacts added to flow"
}
```

#### Get contacts for a flow

```
GET /flows/:flowId/contacts
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Number of contacts per page (default: 100)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "pagination": {
    "page": 1,
    "limit": 100,
    "totalPages": 1
  },
  "data": [
    {
      "id": "contact_id_1",
      "email": "contact1@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "active",
      "currentStep": 0,
      "metadata": {
        "company": "Acme Inc",
        "role": "Manager"
      },
      "stats": {
        "emailsSent": 0,
        "opens": 0,
        "clicks": 0
      },
      "flow": "flow_id",
      "user": "user_id",
      "createdAt": "2025-03-21T11:00:00.000Z",
      "updatedAt": "2025-03-21T11:00:00.000Z"
    },
    {
      "id": "contact_id_2",
      "email": "contact2@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "status": "active",
      "currentStep": 0,
      "metadata": {},
      "stats": {
        "emailsSent": 0,
        "opens": 0,
        "clicks": 0
      },
      "flow": "flow_id",
      "user": "user_id",
      "createdAt": "2025-03-21T11:00:00.000Z",
      "updatedAt": "2025-03-21T11:00:00.000Z"
    }
  ]
}
```

#### Update a contact

```
PUT /flows/:flowId/contacts/:contactId
```

**Request Body:**
```json
{
  "firstName": "Johnny",
  "lastName": "Doe",
  "metadata": {
    "company": "Acme Corp",
    "role": "Director"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "contact_id",
    "email": "contact1@example.com",
    "firstName": "Johnny",
    "lastName": "Doe",
    "metadata": {
      "company": "Acme Corp",
      "role": "Director"
    },
    ...
  }
}
```

#### Delete a contact

```
DELETE /flows/:flowId/contacts/:contactId
```

**Response:**
```json
{
  "success": true,
  "data": {}
}
```

## Email Management

#### Manually trigger email processing (for testing)

```
POST /emails/process
```

**Response:**
```json
{
  "success": true,
  "message": "Email processing triggered"
}
```

## Template Management

#### Get pre-built templates

```
GET /templates
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "welcome-series",
      "name": "Welcome Series",
      "description": "A 3-part welcome series for new subscribers",
      "category": "welcome",
      "steps": [...]
    },
    {
      "id": "product-launch",
      "name": "Product Launch",
      "description": "A 4-part sequence for launching a new product",
      "category": "sales",
      "steps": [...]
    },
    {
      "id": "re-engagement",
      "name": "Re-engagement Campaign",
      "description": "A 3-part sequence to re-engage inactive users",
      "category": "re-engagement",
      "steps": [...]
    }
  ]
}
```

#### Create a new template

```
POST /templates
```

**Request Body:**
```json
{
  "name": "Custom Template",
  "subject": "Custom Email Subject",
  "content": "<p>Custom email content with {{firstName}} placeholder</p>"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template_id",
    "name": "Custom Template",
    ...
  }
}
```

## Billing Management

#### Create checkout session

```
POST /billing/create-checkout-session
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### Cancel subscription

```
POST /billing/cancel-subscription
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription canceled successfully"
}
```

#### Update subscription quantity

```
POST /billing/update-subscription
```

**Request Body:**
```json
{
  "activeFlowCount": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "flowCount": 3
  }
}
```

## Webhooks

### SendGrid Webhook

```
POST /webhook
```

Handles email events from SendGrid (opens, clicks, bounces, etc.)

### Stripe Webhook

```
POST /billing/webhook
```

Handles Stripe events (checkout.session.completed, invoice.paid, customer.subscription.deleted, etc.)

## Email Tracking

### Tracking Pixel (Email Opens)
- **URL**: `/tracking/pixel.gif`
- **Method**: `GET`
- **Auth required**: No (publicly accessible)
- **Rate limit**: 200 requests per minute per IP
- **Description**: 1x1 transparent GIF that records when an email is opened
- **Query Parameters**:
  - `flowId`: ID of the flow
  - `stepId`: ID of the flow step (email)
  - `contactId`: ID of the contact
  - `t`: Timestamp to prevent caching (optional)
- **Response**: 1x1 transparent GIF image
- **Example**: 
  ```
  <img src="https://api.driftly.app/tracking/pixel.gif?flowId=1234&stepId=5678&contactId=9012&t=1647955200000" alt="" width="1" height="1" style="display:none;" />
  ```

### Click Tracking (Email Link Clicks)
- **URL**: `/tracking/redirect`
- **Method**: `GET`
- **Auth required**: No (publicly accessible)
- **Rate limit**: 200 requests per minute per IP
- **Description**: Tracks when a user clicks a link in an email and redirects to the destination URL
- **Query Parameters**:
  - `flowId`: ID of the flow
  - `stepId`: ID of the flow step (email)
  - `contactId`: ID of the contact
  - `url`: The destination URL (must be URL encoded)
- **Response**: 302 redirect to the destination URL
- **Example**: 
  ```
  <a href="https://api.driftly.app/tracking/redirect?flowId=1234&stepId=5678&contactId=9012&url=https%3A%2F%2Fexample.com">Click here</a>
  ```

### Get Tracking Events
- **URL**: `/api/tracking/events/:flowId`
- **Method**: `GET`
- **Auth required**: Yes
- **Description**: Retrieves tracking events for a flow
- **URL Parameters**:
  - `flowId`: ID of the flow
- **Query Parameters**:
  - `startDate`: Filter events after this date (ISO format)
  - `endDate`: Filter events before this date (ISO format)
  - `type`: Filter by event type ('open' or 'click')
  - `limit`: Number of events to return (default: 1000)
  - `page`: Page number for pagination (default: 1)
- **Response**: 
  ```json
  {
    "success": true,
    "events": [
      {
        "_id": "60f9b0f3c9a7a123456789ab",
        "type": "open",
        "flowId": "60f9b0f3c9a7a123456789aa",
        "stepId": "60f9b0f3c9a7a123456789a9",
        "contactId": "60f9b0f3c9a7a123456789a8",
        "timestamp": "2023-07-19T12:00:00.000Z",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2023-07-19T12:00:00.000Z",
        "updatedAt": "2023-07-19T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 1000,
      "pages": 1
    }
  }
  ```

### Get Flow Analytics
- **URL**: `/api/tracking/analytics/:flowId`
- **Method**: `GET`
- **Auth required**: Yes
- **Description**: Retrieves aggregated analytics data for a flow
- **URL Parameters**:
  - `flowId`: ID of the flow
- **Query Parameters**:
  - `startDate`: Filter events after this date (ISO format)
  - `endDate`: Filter events before this date (ISO format)
  - `groupBy`: Time grouping ('hour', 'day', 'week', 'month', default: 'day')
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "open": 150,
        "click": 75,
        "clickThroughRate": 50
      },
      "timeSeriesData": [
        {
          "date": "2023-07-18",
          "open": 50,
          "click": 25
        },
        {
          "date": "2023-07-19",
          "open": 100,
          "click": 50
        }
      ],
      "stepAnalytics": [
        {
          "stepId": "60f9b0f3c9a7a123456789a9",
          "open": 100,
          "click": 50,
          "clickThroughRate": 50
        },
        {
          "stepId": "60f9b0f3c9a7a123456789a7",
          "open": 50,
          "click": 25,
          "clickThroughRate": 50
        }
      ]
    }
  }
  ```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error
