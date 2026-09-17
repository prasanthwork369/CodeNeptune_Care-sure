# Feature Flags Admin API

**Backend API for Admin Panel to control feature flags**

---

## Overview

Admin panel (web) communicates with backend to:
1. View all feature flags
2. Enable/disable features
3. Set rollout percentage (10%, 50%, 100%)
4. Monitor rollout status

---

## API Endpoints

### 1. Get All Feature Flags

**Request**
```
GET /api/v1/admin/feature-flags
Authorization: Bearer <admin-token>
```

**Response**
```json
{
  "flags": [
    {
      "id": "flag_1",
      "name": "virtual_scroll_v2",
      "description": "Virtual scrolling for large lists",
      "enabled": true,
      "rolloutPercentage": 25,
      "createdAt": "2026-09-17T10:00:00Z",
      "updatedAt": "2026-09-17T14:30:00Z",
      "createdBy": "admin@caresure.com",
      "updatedBy": "admin@caresure.com",
      "usersAffected": 2500000,
      "stats": {
        "crashes": 0,
        "errors": 5,
        "performanceChange": "+15%"
      }
    },
    {
      "id": "flag_2",
      "name": "request_batching_v1",
      "description": "Batch API requests",
      "enabled": false,
      "rolloutPercentage": 0,
      "createdAt": "2026-09-17T10:00:00Z",
      "updatedAt": "2026-09-17T10:00:00Z"
    }
  ],
  "lastUpdated": "2026-09-17T14:30:00Z"
}
```

---

### 2. Update Feature Flag

**Request**
```
POST /api/v1/admin/feature-flags/:flagName
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "enabled": true,
  "rolloutPercentage": 10
}
```

**Response**
```json
{
  "success": true,
  "flag": {
    "name": "virtual_scroll_v2",
    "enabled": true,
    "rolloutPercentage": 10,
    "usersAffected": 1000000,
    "updatedAt": "2026-09-17T15:00:00Z"
  },
  "message": "Feature enabled for 10% of users (1M users)"
}
```

---

### 3. Get Feature Flag Details

**Request**
```
GET /api/v1/admin/feature-flags/:flagName
Authorization: Bearer <admin-token>
```

**Response**
```json
{
  "flag": {
    "name": "virtual_scroll_v2",
    "description": "Virtual scrolling for lists",
    "enabled": true,
    "rolloutPercentage": 25,
    "stats": {
      "affectedUsers": 2500000,
      "crashes": 0,
      "errors": 5,
      "performanceGain": "+15%",
      "activeSessions": 50000
    },
    "rolloutHistory": [
      {
        "percentage": 10,
        "changedAt": "2026-09-17T10:30:00Z",
        "changedBy": "admin@caresure.com"
      },
      {
        "percentage": 25,
        "changedAt": "2026-09-17T12:00:00Z",
        "changedBy": "admin@caresure.com"
      }
    ]
  }
}
```

---

### 4. Create New Feature Flag

**Request**
```
POST /api/v1/admin/feature-flags
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "new_feature",
  "description": "New feature description",
  "enabled": false,
  "rolloutPercentage": 0
}
```

**Response**
```json
{
  "success": true,
  "flag": {
    "id": "flag_3",
    "name": "new_feature",
    "description": "New feature description",
    "enabled": false,
    "rolloutPercentage": 0,
    "createdAt": "2026-09-17T15:00:00Z"
  }
}
```

---

### 5. Delete Feature Flag

**Request**
```
DELETE /api/v1/admin/feature-flags/:flagName
Authorization: Bearer <admin-token>
```

**Response**
```json
{
  "success": true,
  "message": "Feature flag deleted"
}
```

---

### 6. Get Rollout Analytics

**Request**
```
GET /api/v1/admin/feature-flags/:flagName/analytics
Authorization: Bearer <admin-token>
```

**Response**
```json
{
  "flag": "virtual_scroll_v2",
  "period": "last_24_hours",
  "analytics": {
    "affectedUsers": 2500000,
    "activeUsers": 500000,
    "metrics": {
      "crashes": {
        "flagOn": 2,
        "flagOff": 15,
        "changePercent": "-87%"
      },
      "performance": {
        "flagOn": "150ms",
        "flagOff": "460ms",
        "improvement": "+68%"
      },
      "memory": {
        "flagOn": "45MB",
        "flagOff": "85MB",
        "improvement": "-47%"
      },
      "engagement": {
        "ordersCompleted": 125000,
        "conversionRate": "45%"
      }
    }
  }
}
```

---

## Usage Examples

### Example 1: Gradual Rollout

**Step 1: Enable for 10%**
```bash
POST /api/v1/admin/feature-flags/virtual_scroll_v2
{
  "enabled": true,
  "rolloutPercentage": 10
}
```
- ✅ 1M out of 10M users get feature
- Monitor for 1 hour

**Step 2: Expand to 25%**
```bash
POST /api/v1/admin/feature-flags/virtual_scroll_v2
{
  "enabled": true,
  "rolloutPercentage": 25
}
```
- ✅ 2.5M out of 10M users get feature
- Monitor for 1 hour

**Step 3: Expand to 50%**
```bash
POST /api/v1/admin/feature-flags/virtual_scroll_v2
{
  "enabled": true,
  "rolloutPercentage": 50
}
```
- ✅ 5M out of 10M users get feature
- Monitor for 1 hour

**Step 4: Full rollout**
```bash
POST /api/v1/admin/feature-flags/virtual_scroll_v2
{
  "enabled": true,
  "rolloutPercentage": 100
}
```
- ✅ All 10M users get feature

---

### Example 2: Emergency Rollback

If bug found at 50%:

```bash
POST /api/v1/admin/feature-flags/virtual_scroll_v2
{
  "enabled": false,
  "rolloutPercentage": 0
}
```
- ✅ Instantly disabled for all users
- Users see old version
- No redeploy needed
- Downtime: 0 seconds

---

## Database Schema

**Feature Flags Table**
```sql
CREATE TABLE feature_flags (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  metadata JSON
);

CREATE TABLE feature_flag_history (
  id VARCHAR(36) PRIMARY KEY,
  flag_name VARCHAR(100) NOT NULL,
  old_percentage INT,
  new_percentage INT,
  changed_at TIMESTAMP,
  changed_by VARCHAR(100),
  FOREIGN KEY (flag_name) REFERENCES feature_flags(name)
);
```

---

## Security

### Access Control
- Only admins can access `/api/v1/admin/*` endpoints
- Require authentication token with `admin` role
- Log all changes with admin username + timestamp

### Rate Limiting
- Max 10 flag updates per minute per admin
- Prevent accidental rapid changes

### Validation
- Rollout percentage: 0-100 only
- Feature name: alphanumeric + underscore
- Description: max 500 characters

---

## Implementation Checklist

**Backend Tasks:**
- [ ] Create `/api/v1/feature-flags` endpoint (GET - public)
- [ ] Create `/api/v1/admin/feature-flags` endpoints (CRUD)
- [ ] Add role-based access control (admin only)
- [ ] Create feature_flags table
- [ ] Create feature_flag_history table (audit log)
- [ ] Add rate limiting
- [ ] Clear mobile app cache when flags update
- [ ] Add monitoring/analytics

**Admin Panel Tasks:**
- [ ] Create feature flags management page
- [ ] Add enable/disable toggle
- [ ] Add percentage slider (0-100)
- [ ] Show affected users count
- [ ] Show rollout history
- [ ] Show performance metrics
- [ ] Add rollback button (instant disable)

---

## Mobile App Integration

**How mobile app uses flags:**

```typescript
import { useFeatureFlag, FEATURE_FLAGS } from '@/src/services/featureFlags';

export function CartLayout() {
  // Check if user should get virtual scrolling
  const useVirtualScroll = useFeatureFlag(FEATURE_FLAGS.VIRTUAL_SCROLL);

  if (useVirtualScroll) {
    return <VirtualizedList items={cartItems} />;
  }

  return <FlatList data={cartItems} />;
}
```

**How it works:**
1. App checks backend every 5 minutes for flag changes
2. Fetches `/api/v1/feature-flags`
3. Caches locally for 5 minutes
4. Uses user ID hash to determine percentage
5. Same user always gets same variant (consistent)
6. Instantly picks up changes on next check

---

## Timeline for Rollout

```
Deploy + Flags OFF:
10:00 AM - Deploy all optimizations (flags disabled)
           All users see old experience

Enable 10%:
10:30 AM - Enable virtual_scroll_v2 for 10%
           Monitor metrics, crashes, errors

Enable 25%:
12:00 PM - Expand to 25% (after 1.5 hours good data)
           Still monitoring

Enable 50%:
01:30 PM - Expand to 50% (after 1.5 hours good data)
           Monitor for edge cases

Enable 100%:
03:00 PM - Full rollout to all users
           All features enabled ✅

Result: 5 hours from deployment to full rollout
        Zero crashes, data-driven decisions
        Safe, professional launch
```

---

## Success Metrics

**Track During Rollout:**

| Metric | Target | Alert If |
|--------|--------|----------|
| Crash rate | <0.1% | >0.5% |
| Error rate | <1% | >5% |
| Performance | +15% | -5% |
| Battery | -5% | -15% |
| Orders completed | +10% | -5% |

If any alert triggered → Disable flag instantly

---

## Summary

Feature flags enable:
✅ Safe gradual rollout (10% → 100%)
✅ Instant rollback if issues
✅ Real-time monitoring
✅ Data-driven decisions
✅ Professional production launch

Backend implements 6 API endpoints for admin panel control.
Mobile app checks flags every 5 minutes.
