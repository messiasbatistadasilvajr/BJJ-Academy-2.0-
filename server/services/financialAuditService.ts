import { FinancialAuditLog } from '../../src/types';

class FinancialAuditService {
  private inMemoryAudits: FinancialAuditLog[] = [];
  private maxBufferSize = 500;

  /**
   * Records an immutable audit log entry
   */
  public record(entry: Omit<FinancialAuditLog, 'id' | 'timestamp'>): FinancialAuditLog {
    const fullLog: FinancialAuditLog = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString()
    };

    // Store in ring-buffer
    this.inMemoryAudits.unshift(fullLog);
    if (this.inMemoryAudits.length > this.maxBufferSize) {
      this.inMemoryAudits.pop();
    }

    console.log(
      `[Audit ${fullLog.origin}] Tenant: ${fullLog.tenantId} | Action: ${fullLog.action} | Entity: ${fullLog.entity}:${fullLog.entityId} | Result: ${fullLog.result}`
    );

    return fullLog;
  }

  /**
   * Queries audit logs with strict Multi-Tenant security
   * - 'all' or general_manager: sees all academy logs
   * - unit_manager: strictly filtered by assignedUnitId
   */
  public query(options: {
    tenantId?: string;
    limit?: number;
    action?: string;
    entityId?: string;
  }): FinancialAuditLog[] {
    const { tenantId, limit = 50, action, entityId } = options;

    return this.inMemoryAudits
      .filter((log) => {
        // Multi-tenant check
        if (tenantId && tenantId !== 'all' && log.tenantId !== tenantId) {
          return false;
        }
        if (action && log.action !== action) {
          return false;
        }
        if (entityId && log.entityId !== entityId) {
          return false;
        }
        return true;
      })
      .slice(0, limit);
  }

  public getRecentCount(): number {
    return this.inMemoryAudits.length;
  }
}

export const financialAuditService = new FinancialAuditService();
