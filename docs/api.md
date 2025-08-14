# Flowboard API Documentation

## Overview

The Flowboard API provides endpoints for managing workflows, executing nodes, and retrieving system information. All endpoints are prefixed with `/api`.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## Error Handling

All endpoints return JSON responses. Errors follow this format:

```json
{
  "error": "Error message"
}
```

## Workflow Management

### Get All Workflows

```
GET /workflows
```

Retrieves a list of all saved workflows.

**Response:**
```json
[
  {
    "id": "workflow-id",
    "name": "Workflow Name",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
]
```

### Get Workflow

```
GET /workflows/:id
```

Retrieves a specific workflow by ID.

**Response:**
```json
{
  "id": "workflow-id",
  "name": "Workflow Name",
  "version": "1.0.0",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "nodes": [...],
  "connections": [...],
  "metadata": {}
}
```

### Save Workflow

```
POST /workflows
```

Saves a workflow to the database and file system.

**Request Body:**
```json
{
  "id": "workflow-id",
  "name": "Workflow Name",
  "nodes": [...],
  "connections": [...]
}
```

**Response:**
```json
{
  "id": "workflow-id"
}
```

### Delete Workflow

```
DELETE /workflows/:id
```

Deletes a workflow by ID.

**Response:**
```json
{
  "message": "Workflow deleted successfully"
}
```

## Template Management

### Get All Templates

```
GET /templates
```

Retrieves a list of all built-in templates.

**Response:**
```json
[
  {
    "id": "template-id",
    "name": "Template Name",
    "description": "Template description",
    "tags": ["tag1", "tag2"]
  }
]
```

### Get Template

```
GET /templates/:id
```

Retrieves a specific template by ID.

**Response:**
```json
{
  "id": "template-id",
  "name": "Template Name",
  "version": "1.0.0",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "nodes": [...],
  "connections": [...],
  "metadata": {
    "description": "Template description",
    "tags": ["tag1", "tag2"]
  }
}
```

## Node Execution

### Execute Script

```
POST /execute
```

Executes a script directly.

**Request Body:**
```json
{
  "scriptPath": "./scripts/test.py",
  "params": {
    "nodeId": "1"
  },
  "nodeId": "1",
  "language": "python"
}
```

**Response:**
```json
{
  "nodeId": "1",
  "output": "Script output",
  "error": "Error output (if any)"
}
```

### Execute Node with Data Flow

```
POST /executeNode
```

Executes a node with data flow support.

**Request Body:**
```json
{
  "node": {
    "id": "1",
    "type": "data-process",
    "scriptPath": "./scripts/test.py",
    "language": "python",
    "parameters": {}
  },
  "workflow": {
    "nodes": [...],
    "connections": [...]
  },
  "inputData": {
    "sourceNodeId": [...]
  }
}
```

**Response:**
```json
{
  "nodeId": "1",
  "output": "Script output",
  "error": "Error output (if any)"
}
```

### Cancel Execution

```
POST /cancel/:nodeId
```

Cancels the execution of a node.

**Response:**
```json
{
  "message": "Execution cancelled"
}
```

### Get Node Output

```
GET /nodeOutput/:nodeId
```

Retrieves the output from a previously executed node.

**Response:**
```json
{
  "output": "Node output"
}
```

## System Information

### Health Check

```
GET /health
```

Checks the health of the server and database connection.

**Response:**
```json
{
  "status": "OK",
  "database": "Connected"
}
```

## Data Models

### Workflow

```json
{
  "id": "string",
  "name": "string",
  "version": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "nodes": [
    {
      "id": "string",
      "type": "string",
      "x": "number",
      "y": "number",
      "parameters": "object"
    }
  ],
  "connections": [
    {
      "id": "string",
      "source": "string",
      "target": "string"
    }
  ],
  "metadata": "object"
}
```

### Node Types

#### Data Input
```json
{
  "id": "string",
  "type": "data-input",
  "x": "number",
  "y": "number",
  "parameters": {
    "source": "string",
    "format": "string"
  }
}
```

#### Data Process
```json
{
  "id": "string",
  "type": "data-process",
  "x": "number",
  "y": "number",
  "scriptPath": "string",
  "language": "string",
  "parameters": "object"
}
```

#### Data Output
```json
{
  "id": "string",
  "type": "data-output",
  "x": "number",
  "y": "number",
  "parameters": {
    "destination": "string",
    "format": "string"
  }
}
```

#### Visualization
```json
{
  "id": "string",
  "type": "visualization",
  "x": "number",
  "y": "number",
  "chartType": "string",
  "dataSource": "string",
  "parameters": "object"
}
```

## Examples

### Saving a Workflow

```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "id": "example-workflow",
    "name": "Example Workflow",
    "nodes": [
      {
        "id": "1",
        "type": "data-input",
        "x": 100,
        "y": 100
      },
      {
        "id": "2",
        "type": "data-process",
        "x": 300,
        "y": 100,
        "scriptPath": "./scripts/test.py",
        "language": "python"
      }
    ],
    "connections": [
      {
        "id": "1",
        "source": "1",
        "target": "2"
      }
    ]
  }'
```

### Executing a Node

```bash
curl -X POST http://localhost:3000/api/executeNode \
  -H "Content-Type: application/json" \
  -d '{
    "node": {
      "id": "2",
      "type": "data-process",
      "scriptPath": "./scripts/test.py",
      "language": "python"
    },
    "workflow": {
      "nodes": [...],
      "connections": [...]
    }
  }'
```

## Rate Limiting

Currently, there is no rate limiting implemented. This may be added in future versions to prevent abuse.

## Versioning

The API does not currently implement versioning. All endpoints are considered version 1.

## Changelog

### v1.0.0
- Initial release
- Workflow management endpoints
- Node execution endpoints
- Health check endpoint
- Template management endpoints