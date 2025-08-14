# Flowboard Architecture

## Overview

Flowboard follows a client-server architecture with a desktop frontend and a backend API. The system is designed to be modular and extensible.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Flowboard Application                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐     ┌──────────────────────────────┐  │
│  │   Frontend      │     │         Backend              │  │
│  │  (Vue +         │     │    (Node.js + Express)       │  │
│  │  Element Plus)  │◄───►│                              │  │
│  └─────────────────┘     │  ┌────────────────────────┐  │  │
│          │               │  │   Workflow Manager     │  │  │
│          │               │  └────────────────────────┘  │  │
│          │               │               │              │  │
│          │               │  ┌────────────────────────┐  │  │
│          │               │  │   Execution Engine     │  │  │
│          │               │  └────────────────────────┘  │  │
│          │               │               │              │  │
│          │               │  ┌────────────────────────┐  │  │
│          │               │  │      Database          │  │  │
│          │               │  │   (PostgreSQL)         │  │  │
│          │               │  └────────────────────────┘  │  │
│          │               └──────────────────────────────┘  │
│          │                                                 │
│  ┌─────────────────┐                                       │
│  │   Electron      │                                       │
│  │   Desktop App   │                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. User Interaction
       │
       ▼
2. Vue Components ◄──┐
       │             │
       ▼             │
3. API Calls ────────┘
       │
       ▼
4. Workflow Manager
       │
       ▼
5. Database (PostgreSQL)
       │
       ▼
6. Execution Engine ◄──┐
       │               │
       ▼               │
7. Script Execution    │
       │               │
       ▼               │
8. Results ─────────────┘
       │
       ▼
9. Response to Frontend
```

## Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vue App                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   App.vue       │  │ Visualization   │  │ Components  │  │
│  │ (Main Layout)   │  │ Node.vue        │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│           │                     │                   │       │
│           ▼                     ▼                   ▼       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ Element Plus    │  │   Chart.js      │  │ Custom      │  │
│  │   UI Library    │  │  Visualization  │  │ Components  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Node.js Server                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                        │
│  │   server.js     │                                        │
│  │ (Main Server)   │                                        │
│  └─────────────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ WorkflowManager │  │ExecutionEngine  │  │    DB       │  │
│  │                 │  │                 │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│           │                     │                   │       │
│           ▼                     ▼                   ▼       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   Workflow      │  │ Python/Julia    │  │ PostgreSQL  │  │
│  │     Model       │  │   Scripts       │  │             │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Workflow Model

```
Workflow
├── id: string
├── name: string
├── version: string
├── createdAt: timestamp
├── updatedAt: timestamp
├── nodes: Node[]
├── connections: Connection[]
└── metadata: object

Node
├── id: string
├── type: string
├── x: number
├── y: number
├── parameters: object
├── scriptPath: string (for data-process nodes)
├── language: string (for data-process nodes)
├── chartType: string (for visualization nodes)
└── dataSource: string (for visualization nodes)

Connection
├── id: string
├── source: string (node id)
└── target: string (node id)
```

## Execution Flow

```
1. User requests node execution
          │
          ▼
2. Frontend sends API request
          │
          ▼
3. Backend receives request
          │
          ▼
4. Execution Engine prepares execution
          │
          ▼
5. Script is executed (Python/Julia)
          │
          ▼
6. Results are captured and stored
          │
          ▼
7. Response is sent to frontend
          │
          ▼
8. Results are displayed to user
```

This architecture allows for:
- Modular development and testing
- Easy extension with new node types
- Scalable script execution
- Persistent workflow storage
- Real-time visualization updates