# HIGH PRIORITY Features - Stellar Games

## Overview
Implement critical features to solve Railway data persistence issues and add essential admin capabilities for the Stellar Games platform.

## Problem Statement
Railway uses ephemeral filesystem - user data in `users.json` gets deleted on every redeploy, causing registered users to lose access. Need automatic solutions that don't require manual Railway Dashboard setup.

## Goals
1. **Solve data persistence automatically** without manual Railway Volume setup
2. **Add admin panel** for user management and system monitoring
3. **Implement robust backup system** with multiple strategies
4. **Add rate limiting** to prevent spam and abuse
5. **Maintain current UX** - no breaking changes to existing auth flow

## Target Users
- **End Users**: Seamless experience, no data loss on redeployments
- **Admin**: Easy user management, system monitoring, backup control
- **Developer**: Automatic solutions, minimal maintenance

---

## Requirements

### R1: Environment Variable Backup System
- **R1.1**: Auto-backup users.json to Railway environment variables on every user change
- **R1.2**: Auto-restore from environment variables on server startup
- **R1.3**: Handle environment variable size limits (32KB per variable)
- **R1.4**: Compress data if needed to fit within limits
- **R1.5**: Fallback gracefully if backup/restore fails

### R2: Admin Panel
- **R2.1**: Secure admin authentication (separate from regular users)
- **R2.2**: User management (view, edit, delete users)
- **R2.3**: System statistics dashboard
- **R2.4**: Backup management interface
- **R2.5**: Rate limiting configuration
- **R2.6**: Real-time monitoring

### R3: Enhanced Backup System
- **R3.1**: Multiple backup strategies (Environment Variables + GitHub + File)
- **R3.2**: Automatic daily backups
- **R3.3**: Backup verification and integrity checks
- **R3.4**: Manual backup triggers from admin panel
- **R3.5**: Backup history and restore points

### R4: Rate Limiting
- **R4.1**: Registration rate limiting (per IP)
- **R4.2**: Login attempt rate limiting (per IP + per username)
- **R4.3**: API endpoint rate limiting
- **R4.4**: Configurable limits via admin panel
- **R4.5**: Temporary IP blocking for abuse

### R5: Security & Monitoring
- **R5.1**: Admin activity logging
- **R5.2**: Failed login attempt monitoring
- **R5.3**: System health checks
- **R5.4**: Automated alerts for critical issues

---

## Design

### Architecture Overview
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Storage       │
│                 │    │                  │    │                 │
│ • Admin Panel   │◄──►│ • Admin API      │◄──►│ • users.json    │
│ • Rate Limit    │    │ • Backup Service │    │ • ENV Variables │
│   Display       │    │ • Rate Limiter   │    │ • GitHub Backup │
│                 │    │ • Monitoring     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Registration/Login** → Rate Limiter → Auth Service → FileAuthRepository
2. **Data Change** → Auto-backup to ENV Variables + GitHub
3. **Server Startup** → Auto-restore from ENV Variables (if users.json missing)
4. **Admin Actions** → Admin Service → Backup Service → Multiple Storage

### Backup Strategy Priority
1. **Primary**: Environment Variables (automatic, survives redeployments)
2. **Secondary**: GitHub Backup (existing, for history)
3. **Tertiary**: Local File (current, ephemeral)

---

## Implementation Plan

### Phase 1: Environment Variable Backup System
**Files to Create/Modify:**
- `src/infrastructure/backup/EnvironmentBackupService.js` (NEW)
- `src/infrastructure/persistence/FileAuthRepository.js` (MODIFY)
- `src/config/constants.js` (MODIFY)

**Key Features:**
- Compress JSON data using built-in zlib
- Split large data across multiple environment variables if needed
- Automatic backup on every user data change
- Automatic restore on server startup

### Phase 2: Rate Limiting System
**Files to Create/Modify:**
- `src/infrastructure/middleware/rateLimitMiddleware.js` (NEW)
- `src/domain/security/services/RateLimitService.js` (NEW)
- `src/infrastructure/web/routes/authRoutes.js` (MODIFY)

**Key Features:**
- In-memory rate limiting (survives until restart)
- Configurable limits per endpoint
- IP-based and username-based limiting
- Temporary blocking for repeated violations

### Phase 3: Admin Panel Backend
**Files to Create/Modify:**
- `src/domain/admin/entities/Admin.js` (NEW)
- `src/domain/admin/services/AdminService.js` (MODIFY - enhance existing)
- `src/application/useCases/admin/` (NEW - multiple use cases)
- `src/infrastructure/web/routes/adminRoutes.js` (NEW)
- `src/infrastructure/middleware/adminMiddleware.js` (MODIFY - enhance existing)

**Key Features:**
- Admin user management
- System statistics API
- Backup management API
- Rate limit configuration API

### Phase 4: Admin Panel Frontend
**Files to Create/Modify:**
- `frontend/src/components/admin/AdminPanel.jsx` (NEW)
- `frontend/src/components/admin/UserManagement.jsx` (NEW)
- `frontend/src/components/admin/SystemStats.jsx` (NEW)
- `frontend/src/components/admin/BackupManager.jsx` (NEW)
- `frontend/src/services/adminService.js` (NEW)

**Key Features:**
- Responsive admin dashboard
- Real-time statistics
- User CRUD operations
- Backup management interface

### Phase 5: Enhanced Monitoring & Alerts
**Files to Create/Modify:**
- `src/infrastructure/monitoring/SystemMonitor.js` (NEW)
- `src/infrastructure/alerts/AlertService.js` (NEW)
- `src/infrastructure/logging/AdminLogger.js` (NEW)

**Key Features:**
- System health monitoring
- Automated backup verification
- Admin activity logging
- Critical issue alerts

---

## Technical Specifications

### Environment Variable Backup Format
```javascript
// Environment Variables:
STELLAR_USERS_BACKUP_1=<compressed_json_chunk_1>
STELLAR_USERS_BACKUP_2=<compressed_json_chunk_2>
STELLAR_USERS_BACKUP_COUNT=2
STELLAR_USERS_BACKUP_TIMESTAMP=2026-05-03T10:30:00Z
```

### Rate Limiting Configuration
```javascript
const RATE_LIMITS = {
  registration: { windowMs: 15 * 60 * 1000, max: 3 }, // 3 per 15 minutes
  login: { windowMs: 15 * 60 * 1000, max: 10 },       // 10 per 15 minutes
  api: { windowMs: 60 * 1000, max: 100 }              // 100 per minute
};
```

### Admin Panel Routes
```
GET  /api/v1/admin/stats          - System statistics
GET  /api/v1/admin/users          - List all users
PUT  /api/v1/admin/users/:id      - Update user
DELETE /api/v1/admin/users/:id    - Delete user
POST /api/v1/admin/backup/create  - Manual backup
GET  /api/v1/admin/backup/status  - Backup status
POST /api/v1/admin/backup/restore - Restore from backup
```

---

## Success Criteria

### Functional Requirements
- ✅ Users don't lose access after Railway redeployments
- ✅ Admin can manage users through web interface
- ✅ System automatically backs up data to multiple locations
- ✅ Rate limiting prevents spam and abuse
- ✅ Real-time monitoring shows system health

### Performance Requirements
- ✅ Backup operations complete within 5 seconds
- ✅ Admin panel loads within 2 seconds
- ✅ Rate limiting adds <50ms latency to requests
- ✅ Environment variable restore completes within 10 seconds

### Security Requirements
- ✅ Admin panel requires separate authentication
- ✅ All admin actions are logged
- ✅ Rate limiting prevents brute force attacks
- ✅ Backup data is compressed and validated

---

## Testing Strategy

### Unit Tests
- Environment backup/restore functions
- Rate limiting logic
- Admin service methods
- Data compression/decompression

### Integration Tests
- Full backup/restore cycle
- Admin panel CRUD operations
- Rate limiting with real requests
- Multi-strategy backup coordination

### Manual Testing
- Railway redeployment data persistence
- Admin panel usability on mobile
- Rate limiting behavior under load
- Backup integrity after compression

---

## Deployment Plan

### Pre-deployment
1. Create admin user credentials
2. Set up environment variables for backup
3. Test backup/restore locally
4. Verify rate limiting configuration

### Deployment Steps
1. Deploy backend changes
2. Deploy frontend admin panel
3. Create initial admin user
4. Verify all systems operational
5. Test full backup/restore cycle

### Post-deployment
1. Monitor system performance
2. Verify automatic backups working
3. Test admin panel functionality
4. Document admin procedures

---

## Maintenance

### Daily Tasks
- Monitor backup success/failure
- Review rate limiting logs
- Check system health metrics

### Weekly Tasks
- Verify backup integrity
- Review admin activity logs
- Update rate limiting rules if needed

### Monthly Tasks
- Clean up old backup data
- Review and optimize performance
- Update admin panel features

---

## Risk Mitigation

### Data Loss Risk
- **Mitigation**: Multiple backup strategies (ENV + GitHub + File)
- **Fallback**: Manual data recovery from logs

### Performance Risk
- **Mitigation**: Asynchronous backup operations
- **Monitoring**: Real-time performance metrics

### Security Risk
- **Mitigation**: Admin authentication + activity logging
- **Monitoring**: Failed login attempt tracking

### Scalability Risk
- **Mitigation**: Environment variable size limits handling
- **Future**: Migration path to database when needed

---

## Future Enhancements

### Short-term (1-2 months)
- Database migration option
- Advanced admin analytics
- Automated backup scheduling
- Enhanced rate limiting rules

### Long-term (3-6 months)
- Multi-admin support
- Backup encryption
- Advanced monitoring dashboard
- API rate limiting per user

---

## Notes

- **Railway Compatibility**: All solutions designed to work within Railway's constraints
- **No Manual Setup**: Everything automated, no Railway Dashboard configuration required
- **Backward Compatible**: Existing users and functionality preserved
- **Mobile Optimized**: Admin panel works on mobile devices
- **Indonesian Support**: Admin interface supports Indonesian language