# Datto Backup Node for n8n

[![npm version](https://badge.fury.io/js/%40joshuanode%2Fn8n-nodes-datto-backup.svg)](https://www.npmjs.com/package/@joshuanode/n8n-nodes-datto-backup)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n community](https://img.shields.io/badge/n8n-community%20node-ff6d5a?style=flat-square)](https://n8n.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub](https://img.shields.io/badge/GitHub-ajoshuasmith-181717?logo=github)](https://github.com/ajoshuasmith)

Community node for the **Datto API** — built for MSPs managing backup devices at scale.

## Features

### BCDR (Backup, Continuity & Disaster Recovery)

| Resource       | Operations    | Description                        |
| -------------- | ------------- | ---------------------------------- |
| **Device**     | Get, Get Many | BCDR appliances and cloud devices  |
| **Agent**      | Get Many      | Backup agents on protected systems |
| **Alert**      | Get Many      | Device alerts and notifications    |
| **Asset**      | Get Many      | Combined view of agents and shares |
| **Share**      | Get Many      | Network shares being backed up     |
| **Volume**     | Get           | Storage volumes on a device        |
| **VM Restore** | Get Many      | Virtual machine restore operations |

### Reporting

| Resource         | Operations | Description                          |
| ---------------- | ---------- | ------------------------------------ |
| **Activity Log** | Get Many   | User activity audit log with filters |

### SaaS Protection

| Resource             | Operations | Description                  |
| -------------------- | ---------- | ---------------------------- |
| **SaaS Domain**      | Get Many   | Protected domains            |
| **SaaS Seat**        | Get Many   | Customer seat allocations    |
| **SaaS Application** | Get Many   | Backup data for applications |

### Direct-to-Cloud (Endpoint Backup)

| Resource             | Operations                   | Description              |
| -------------------- | ---------------------------- | ------------------------ |
| **DTC Asset**        | Get, Get Many, Get by Client | Endpoint backup assets   |
| **DTC RMM Template** | Get Many                     | RMM deployment templates |
| **DTC Storage Pool** | Get Many                     | Storage pool usage       |

## Installation

### Community Nodes (Recommended)

1. In n8n, go to **Settings → Community Nodes → Install**
2. Enter: `@joshuanode/n8n-nodes-datto-backup`
3. Click **Install**

### Manual Installation

```bash
npm install @joshuanode/n8n-nodes-datto-backup
```

## Credentials

### Getting API Keys

1. Log into the [Datto Partner Portal](https://portal.dattobackup.com)
2. Navigate to **Admin → Integrations**
3. Select the **API Keys** tab
4. Click **Create API Key** and provide a name
5. Copy both the **Public Key** and **Secret Key**

### Configuring in n8n

1. In n8n, create new credentials for **Datto Backup API**
2. Enter your **Public API Key**
3. Enter your **Secret API Key**
4. Click **Save** — the credentials will be tested automatically

## Usage Examples

### Get All Devices with Alerts

```
1. Datto Backup → Device → Get Many (Return All: true)
2. Loop Over Items
3. Datto Backup → Alert → Get Many (Serial Number: {{$json.serialNumber}})
```

### Monitor Backup Status Across Tenants

```
1. Datto Backup → Device → Get Many
2. Filter → devices with backup issues
3. Send notification (Slack, Email, etc.)
```

## License

[MIT](LICENSE)
