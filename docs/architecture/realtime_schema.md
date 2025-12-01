# Real-Time Sync Server Schema & RLS

## Overview
This document defines the schema for the dedicated Real-Time Sync Server and the Row Level Security (RLS) policies for the BaaS persistence layer.

## 1. Real-Time Binary Schema
The Real-Time Sync Server uses a lightweight binary protocol over WebTransport datagrams to minimize latency.

### Packet Structure (Little Endian)
| Offset | Type | Name | Description |
| :--- | :--- | :--- | :--- |
| 0 | Uint32 | `EntityID` | Unique identifier for the entity (e.g., Player ID) |
| 4 | Float32 | `PosX` | X coordinate of the entity |
| 8 | Float32 | `PosY` | Y coordinate of the entity |
| 12 | Float32 | `Rotation` | Rotation in radians |
| **16** | **Total Bytes** | | |

**Notes:**
- No metadata (names, inventory) is sent in this packet.
- Updates are unreliable (fire-and-forget).

## 2. BaaS RLS Policies (Supabase)
To ensure security and enforce the use of the Real-Time Sync Server for high-frequency updates, direct client-side writes to position data are blocked.

### Table: `player_positions`
This table mirrors the real-time state for persistence/recovery but is NOT written to directly by the client for movement.

#### Policy: `deny_client_position_write`
- **Operation**: `UPDATE`, `INSERT`
- **Target Role**: `authenticated` (Client)
- **Using**: `false` (Always deny)
- **Check**: `false` (Always deny)

#### Policy: `allow_server_sync_write`
- **Operation**: `ALL`
- **Target Role**: `service_role` (Sync Server)
- **Using**: `true`
- **Check**: `true`

### Table: `players` (Metadata)
- **Operation**: `UPDATE`
- **Columns**: `display_name`, `inventory`, `stats`
- **Policy**: Allow authenticated users to update their own row.
