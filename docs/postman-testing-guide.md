# Postman API Testing Guide

Complete guide to test all Buteak Workflow APIs using Postman.

**Base URL (Local):** `http://localhost:3000/workflow`  
**Base URL (Production):** `https://api.buteak.in/workflow`

---

## 📋 Table of Contents

1. [Escalation API](#escalation-api)
2. [Configuration Management APIs](#configuration-management-apis)
3. [Staff Management API](#staff-management-api)
4. [WATI Integration APIs](#wati-integration-apis)
5. [Environment Setup](#environment-setup)
6. [Test Scenarios](#test-scenarios)

---

## 1. Escalation API

### 1.1 Start Escalation (Sequential)

**Endpoint:** `POST /workflow/api/escalation`

**Description:** Starts a sequential escalation process with AI task classification.

**Request:**

```json
POST http://localhost:3000/workflow/api/escalation
Content-Type: application/json

{
  "recordId": "926382000001538005",
  "levels": ["L1", "L2", "L3"],
  "type": "escalate"
}
```

**Expected Response (Success):**

```json
{
  "success": true,
  "message": "Escalation started",
  "recordId": "926382000001538005",
  "task": "Bring me a towel",
  "category": "T1",
  "type": "escalate",
  "levels": ["L1", "L2", "L3"],
  "requestName": "Bring me a towel",
  "status": 200
}
```

**Expected Response (Already Handled):**

```json
{
  "success": true,
  "message": "Service request already handled. Current status: Completed",
  "recordId": "926382000001538005",
  "task": "Bring me a towel",
  "category": "T1",
  "type": "escalate",
  "levels": ["L1", "L2", "L3"],
  "currentStatus": "Completed",
  "status": 200
}
```

**Error Response (Invalid Levels):**

```json
{
  "success": false,
  "message": "Invalid levels: L5. Valid levels are: L1, L2, L3, L4",
  "status": 400
}
```

**Error Response (Record Not Found):**

```json
{
  "success": false,
  "message": "Service request with ID 926382000001538005 not found",
  "status": 404
}
```

---

### 1.2 Start Broadcast (Parallel)

**Endpoint:** `POST /workflow/api/escalation`

**Description:** Sends messages to all staff at specified levels simultaneously.

**Request:**

```json
POST http://localhost:3000/workflow/api/escalation
Content-Type: application/json

{
  "recordId": "926382000001538005",
  "levels": ["L2", "L3", "L4"],
  "type": "broadcast"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Broadcast sent",
  "recordId": "926382000001538005",
  "task": "Emergency: Water leakage in room 101",
  "category": "T4",
  "type": "broadcast",
  "levels": ["L2", "L3", "L4"],
  "requestName": "Emergency: Water leakage in room 101",
  "status": 200
}
```

**Note:** T4 (Critical Emergency) tasks are automatically converted to broadcast mode regardless of the `type` parameter.

---

## 2. Configuration Management APIs

### 2.1 Get Current Configuration

**Endpoint:** `GET /workflow/api/config/escalation`

**Description:** Retrieves the current escalation configuration.

**Request:**

```
GET http://localhost:3000/workflow/api/config/escalation
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "timings": {
      "T1": 10000,
      "T2": 60000,
      "T3": 120000,
      "T4": 0,
      "escalationWait": 20000
    },
    "levels": {
      "L1": "Reception",
      "L2": "Manager",
      "L3": "Owner",
      "L4": "Director"
    }
  },
  "message": "Configuration retrieved successfully"
}
```

---

### 2.2 Update Entire Configuration

**Endpoint:** `PUT /workflow/api/config/escalation`

**Description:** Updates the entire escalation configuration (timings + levels).

**Request:**

```json
PUT http://localhost:3000/workflow/api/config/escalation
Content-Type: application/json

{
  "timings": {
    "T1": 15000,
    "T2": 90000,
    "T3": 180000,
    "T4": 0,
    "escalationWait": 25000
  },
  "levels": {
    "L1": "Front Desk",
    "L2": "Supervisor",
    "L3": "Manager",
    "L4": "General Manager",
    "L5": "Director"
  }
}
```

**Expected Response (Success):**

```json
{
  "success": true,
  "data": {
    "timings": {
      "T1": 15000,
      "T2": 90000,
      "T3": 180000,
      "T4": 0,
      "escalationWait": 25000
    },
    "levels": {
      "L1": "Front Desk",
      "L2": "Supervisor",
      "L3": "Manager",
      "L4": "General Manager",
      "L5": "Director"
    }
  },
  "message": "Configuration updated successfully"
}
```

**Error Response (Validation Failed):**

```json
{
  "success": false,
  "message": "Invalid configuration",
  "errors": [
    "T4 (Critical Emergency) must be 0 for immediate broadcast",
    "T1 must be a non-negative number"
  ]
}
```

---

### 2.3 Update Only Timings

**Endpoint:** `PATCH /workflow/api/config/escalation/timings`

**Description:** Updates only the timing configuration, keeps levels unchanged.

**Request:**

```json
PATCH http://localhost:3000/workflow/api/config/escalation/timings
Content-Type: application/json

{
  "T1": 5000,
  "T2": 30000,
  "T3": 60000,
  "T4": 0,
  "escalationWait": 15000
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "timings": {
      "T1": 5000,
      "T2": 30000,
      "T3": 60000,
      "T4": 0,
      "escalationWait": 15000
    },
    "levels": {
      "L1": "Reception",
      "L2": "Manager",
      "L3": "Owner",
      "L4": "Director"
    }
  },
  "message": "Timings updated successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Invalid timings configuration",
  "errors": ["T4 (Critical Emergency) must be 0 for immediate broadcast"]
}
```

---

### 2.4 Update Only Levels

**Endpoint:** `PATCH /workflow/api/config/escalation/levels`

**Description:** Updates only the level-to-role mapping, keeps timings unchanged.

**Request:**

```json
PATCH http://localhost:3000/workflow/api/config/escalation/levels
Content-Type: application/json

{
  "L1": "Reception",
  "L2": "Manager",
  "L3": "Owner"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "timings": {
      "T1": 5000,
      "T2": 30000,
      "T3": 60000,
      "T4": 0,
      "escalationWait": 15000
    },
    "levels": {
      "L1": "Reception",
      "L2": "Manager",
      "L3": "Owner"
    }
  },
  "message": "Levels updated successfully"
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Invalid levels configuration",
  "errors": [
    "Invalid level key: Level1. Must match pattern L1, L2, L3, etc.",
    "Level L2 must have a non-empty role name"
  ]
}
```

---

## 3. Staff Management API

### 3.1 Get Staff with Least Tickets

**Endpoint:** `GET /workflow/api/staff/less-tickets`

**Description:** Finds the staff member with the least number of assigned service requests for a given role. Useful for load balancing.

**Query Parameters:**

- `staffRole` (required): The role to search for (e.g., "Manager", "Reception", "Owner")

**Request:**

```
GET http://localhost:3000/workflow/api/staff/less-tickets?staffRole=Manager
```

**Expected Response (Success):**

```json
{
  "success": true,
  "data": {
    "staffId": "926382000001539025",
    "mobileNo": "918210702924",
    "totalRequests": 3
  },
  "status": 200
}
```

**Error Response:**

```json
{
  "status": 500,
  "message": "Error message here"
}
```

**Use Cases:**

- Assign new service requests to the least busy staff member
- Load balancing across team members
- Finding available staff for immediate tasks

**Example with Different Roles:**

```
GET {{BASE_URL}}/api/staff/less-tickets?staffRole=Reception
GET {{BASE_URL}}/api/staff/less-tickets?staffRole=Manager
GET {{BASE_URL}}/api/staff/less-tickets?staffRole=Owner
```

---

## 4. WATI Integration APIs

### 4.1 Get Current Session Messages

**Endpoint:** `GET /workflow/api/wati/current-session/messages`

**Description:** Retrieves all messages from the current WhatsApp session for a given mobile number. Session ends when the chat is closed by the bot.

**Query Parameters:**

- `mobileNo` (required): Mobile number with country code (e.g., "918210702924")

**Request:**

```
GET http://localhost:3000/workflow/api/wati/current-session/messages?mobileNo=918210702924
```

**Expected Response (Success):**

```json
{
  "success": true,
  "currentSessionMessages": [
    {
      "text": "Hello, I need help with my room",
      "type": "text",
      "messagedBy": "Customer"
    },
    {
      "text": "Sure, how can I assist you?",
      "type": "text",
      "messagedBy": "Company"
    },
    {
      "text": "The AC is not working",
      "type": "text",
      "messagedBy": "Customer"
    }
  ],
  "status": 200
}
```

**Error Response:**

```json
{
  "status": 500,
  "error": "Error details"
}
```

**Notes:**

- Messages are returned in chronological order
- Session ends when bot closes the chat (eventType: "ticket", eventDescription: "The chat has been closed by Bot")
- Only includes messages with text content

---

### 4.2 Get Reply to Context Message

**Endpoint:** `GET /workflow/api/wati/current-session/reply-to-context-message`

**Description:** Retrieves the reply to a specific message using message ID and conversation ID.

**Query Parameters:**

- `messageId` (required): The ID of the message
- `conversationId` (required): The conversation ID

**Request:**

```
GET http://localhost:3000/workflow/api/wati/current-session/reply-to-context-message?messageId=MSG123&conversationId=CONV456
```

**Expected Response (Success):**

```json
{
  "success": true,
  "currentSessionMessages": {
    // Message details returned by WATI API
  },
  "status": 200
}
```

**Error Response:**

```json
{
  "status": 500,
  "error": "Error details"
}
```

---

## 5. Environment Setup

### 3.1 Postman Environment Variables

Create a Postman environment with these variables:

**Local Development:**

```
BASE_URL = http://localhost:3000/workflow
```

**Production:**

```
BASE_URL = https://api.buteak.in/workflow
```

### 3.2 Using Environment Variables in Postman

In your requests, use:

```
{{BASE_URL}}/api/escalation
{{BASE_URL}}/api/config/escalation
```

---

## 4. Test Scenarios

### Scenario 1: Test T1 Task (Immediate Response)

1. **Update timings to fast values for testing:**

```json
PATCH {{BASE_URL}}/api/config/escalation/timings

{
  "T1": 5000,
  "T2": 30000,
  "T3": 60000,
  "T4": 0,
  "escalationWait": 10000
}
```

2. **Create a T1 task in Zoho:**

   - Title: "Bring me a towel"
   - Status: Pending
   - Room: 1000

3. **Start escalation:**

```json
POST {{BASE_URL}}/api/escalation

{
  "recordId": "YOUR_RECORD_ID",
  "levels": ["L1", "L2"],
  "type": "escalate"
}
```

4. **Expected behavior:**
   - Task classified as T1
   - Initial wait: 5 seconds
   - Escalates to L1 (Reception)
   - Waits 10 seconds
   - Escalates to L2 (Manager)

---

### Scenario 2: Test T4 Emergency (Auto-Broadcast)

1. **Create a T4 task in Zoho:**

   - Title: "Water leakage in room 101"
   - Status: Pending

2. **Try to escalate (will auto-convert to broadcast):**

```json
POST {{BASE_URL}}/api/escalation

{
  "recordId": "YOUR_RECORD_ID",
  "levels": ["L1", "L2", "L3"],
  "type": "escalate"
}
```

3. **Expected behavior:**
   - Task classified as T4
   - Type automatically changed to "broadcast"
   - Messages sent to ALL staff at L1, L2, L3 simultaneously
   - No waiting between messages

---

### Scenario 3: Add New Level

1. **Get current config:**

```
GET {{BASE_URL}}/api/config/escalation
```

2. **Add L5 level:**

```json
PATCH {{BASE_URL}}/api/config/escalation/levels

{
  "L1": "Reception",
  "L2": "Manager",
  "L3": "Owner",
  "L4": "Director",
  "L5": "CEO"
}
```

3. **Test with new level:**

```json
POST {{BASE_URL}}/api/escalation

{
  "recordId": "YOUR_RECORD_ID",
  "levels": ["L1", "L2", "L3", "L4", "L5"],
  "type": "escalate"
}
```

---

### Scenario 4: Test Validation Errors

**Test 1: Invalid Level**

```json
POST {{BASE_URL}}/api/escalation

{
  "recordId": "926382000001538005",
  "levels": ["L1", "L99"],
  "type": "escalate"
}
```

Expected: `400 Bad Request` with error message

**Test 2: Invalid Timing**

```json
PATCH {{BASE_URL}}/api/config/escalation/timings

{
  "T1": -5000,
  "T2": 30000,
  "T3": 60000,
  "T4": 0,
  "escalationWait": 15000
}
```

Expected: `400 Bad Request` with validation errors

**Test 3: T4 Not Zero**

```json
PATCH {{BASE_URL}}/api/config/escalation/timings

{
  "T1": 5000,
  "T2": 30000,
  "T3": 60000,
  "T4": 10000,
  "escalationWait": 15000
}
```

Expected: `400 Bad Request` - "T4 must be 0"

---

## 5. Quick Reference

### All Endpoints

| Method               | Endpoint                                                                                         | Purpose                       |
| -------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| **Escalation**       |                                                                                                  |                               |
| POST                 | `/workflow/api/escalation`                                                                       | Start escalation or broadcast |
| **Configuration**    |                                                                                                  |                               |
| GET                  | `/workflow/api/config/escalation`                                                                | Get current config            |
| PUT                  | `/workflow/api/config/escalation`                                                                | Update entire config          |
| PATCH                | `/workflow/api/config/escalation/timings`                                                        | Update only timings           |
| PATCH                | `/workflow/api/config/escalation/levels`                                                         | Update only levels            |
| **Staff Management** |                                                                                                  |                               |
| GET                  | `/workflow/api/staff/less-tickets?staffRole={role}`                                              | Get staff with least tickets  |
| **WATI Integration** |                                                                                                  |                               |
| GET                  | `/workflow/api/wati/current-session/messages?mobileNo={number}`                                  | Get current session messages  |
| GET                  | `/workflow/api/wati/current-session/reply-to-context-message?messageId={id}&conversationId={id}` | Get reply to context message  |

### Time Conversions

| Duration   | Milliseconds |
| ---------- | ------------ |
| 5 seconds  | 5000         |
| 10 seconds | 10000        |
| 30 seconds | 30000        |
| 1 minute   | 60000        |
| 5 minutes  | 300000       |
| 10 minutes | 600000       |
| 1 hour     | 3600000      |

### Task Categories

| Category | Name               | Default Time        | Examples                |
| -------- | ------------------ | ------------------- | ----------------------- |
| T1       | Immediate Response | 5-10 seconds (dev)  | Towel, water, invoice   |
| T2       | Standard Service   | 30-60 seconds (dev) | Food delivery, cleaning |
| T3       | Technical Issues   | 1-2 minutes (dev)   | AC repair, plumbing     |
| T4       | Critical Emergency | 0 (immediate)       | Water leakage, fire     |

---

## 6. Postman Collection Import

You can import this as a Postman collection. Create a new collection and add these requests manually, or use the Postman Collection format.

**Collection Name:** Buteak Workflow APIs  
**Base URL Variable:** `{{BASE_URL}}`

---

**Happy Testing!** 🚀
