import { PrismaClient, type Attendance, AttendanceStatus, AttendanceApprovalStatus, DaySummaryStatus } from "@prisma/client";

export class AttendanceRepository {
  private getPrismaClient() {
    return new PrismaClient();
  }

  async create(
    data: Omit<Attendance, "id" | "createdAt" | "updatedAt">
  ): Promise<Attendance> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendance.create({
        data,
        include: { employee: true, createdBy: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async findById(id: number): Promise<Attendance | null> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendance.findUnique({
        where: { id },
        include: { employee: true, createdBy: true },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async findAll(filters?: {
    employeeId?: number;
    entrepriseId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    status?: AttendanceStatus;
    createdById?: number;
  }): Promise<Attendance[]> {
    const prismaClient = this.getPrismaClient();
    try {
      const where: any = {};

      if (filters?.employeeId) {
        where.employeeId = filters.employeeId;
      }

      if (filters?.entrepriseId) {
        where.employee = {
          entrepriseId: filters.entrepriseId
        };
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.date = {};
        if (filters.dateFrom) {
          where.date.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.date.lte = filters.dateTo;
        }
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.createdById) {
        where.createdById = filters.createdById;
      }

      return await prismaClient.attendance.findMany({
        where,
        include: {
          employee: {
            include: { entreprise: true }
          },
          createdBy: true
        },
        orderBy: [
          { date: "desc" },
          { employee: { nomComplet: "asc" } }
        ],
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async findByEmployeeAndDate(employeeId: number, date: Date): Promise<Attendance | null> {
    const prismaClient = this.getPrismaClient();
    try {
      // Normalize date to start of day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return await prismaClient.attendance.findFirst({
        where: {
          employeeId,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: { employee: true, createdBy: true },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async update(
    id: number,
    data: Partial<Omit<Attendance, "id" | "createdAt" | "updatedAt">>
  ): Promise<Attendance> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendance.update({
        where: { id },
        data,
        include: { employee: true, createdBy: true },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async delete(id: number): Promise<Attendance> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendance.delete({
        where: { id },
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async bulkCreate(attendances: Omit<Attendance, "id" | "createdAt" | "updatedAt">[]): Promise<Attendance[]> {
    const prismaClient = this.getPrismaClient();
    try {
      const createdAttendances = await prismaClient.$transaction(
        attendances.map(attendance =>
          prismaClient.attendance.create({
            data: attendance,
            include: { employee: true, createdBy: true }
          })
        )
      );
      return createdAttendances;
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async getAttendanceStats(employeeId: number, dateFrom: Date, dateTo: Date) {
    const prismaClient = this.getPrismaClient();
    try {
      const attendances = await prismaClient.attendance.findMany({
        where: {
          employeeId,
          date: {
            gte: dateFrom,
            lte: dateTo
          }
        }
      });

      const stats = {
        totalDays: attendances.length,
        presentDays: attendances.filter(a => a.status === 'PRESENT').length,
        absentDays: attendances.filter(a => a.status === 'ABSENT').length,
        lateDays: attendances.filter(a => a.status === 'RETARD').length,
        leaveDays: attendances.filter(a => a.status === 'CONGE' || a.status === 'MALADIE').length,
        totalHours: attendances.reduce((sum, a) => sum + (a.hoursWorked || 0), 0),
        overtimeHours: attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
        breakHours: attendances.reduce((sum, a) => sum + (a.breakHours || 0), 0)
      };

      return stats;
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // Break management methods
  async startBreak(attendanceId: number, userId: number): Promise<Attendance> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendance.update({
        where: { id: attendanceId },
        data: {
          breakStartTime: new Date(),
          updatedAt: new Date()
        },
        include: { employee: true, createdBy: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async endBreak(attendanceId: number, userId: number): Promise<Attendance> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendance.update({
        where: { id: attendanceId },
        data: {
          breakEndTime: new Date(),
          updatedAt: new Date()
        },
        include: { employee: true, createdBy: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // Approval workflow methods
  async approveAttendance(attendanceId: number, approvedById: number, justification?: string): Promise<Attendance> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendance.update({
        where: { id: attendanceId },
        data: {
          approvalStatus: 'APPROVED',
          approvedById,
          approvedAt: new Date(),
          justification: justification || null,
          updatedAt: new Date()
        },
        include: { employee: true, createdBy: true, approvedBy: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async rejectAttendance(attendanceId: number, approvedById: number, justification?: string): Promise<Attendance> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendance.update({
        where: { id: attendanceId },
        data: {
          approvalStatus: 'REJECTED',
          approvedById,
          approvedAt: new Date(),
          justification: justification || null,
          updatedAt: new Date()
        },
        include: { employee: true, createdBy: true, approvedBy: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async correctAttendance(attendanceId: number, correctionData: Partial<Attendance>, correctedById: number, justification: string | undefined): Promise<Attendance> {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendance.update({
        where: { id: attendanceId },
        data: {
          ...correctionData,
          approvalStatus: 'CORRECTED',
          approvedById: correctedById,
          approvedAt: new Date(),
          justification: justification || null,
          updatedAt: new Date()
        },
        include: { employee: true, createdBy: true, approvedBy: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // Audit trail methods
  async createAuditLog(attendanceId: number, action: string, performedById: number, oldValues?: any, newValues?: any, justification?: string) {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendanceAudit.create({
        data: {
          attendanceId,
          action,
          oldValues: oldValues ? JSON.stringify(oldValues) : null,
          newValues: newValues ? JSON.stringify(newValues) : null,
          justification: justification || null,
          performedById
        }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async getAuditTrail(attendanceId: number) {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.attendanceAudit.findMany({
        where: { attendanceId },
        include: { performedBy: true },
        orderBy: { performedAt: 'desc' }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // Day summary methods
  async createOrUpdateDaySummary(employeeId: number, date: Date, summaryData: any) {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.daySummary.upsert({
        where: {
          employeeId_date: {
            employeeId,
            date
          }
        },
        update: {
          ...summaryData,
          updatedAt: new Date()
        },
        create: {
          employeeId,
          date,
          ...summaryData
        },
        include: { employee: true, payRun: true }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async getDaySummaries(employeeId: number, dateFrom: Date, dateTo: Date) {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.daySummary.findMany({
        where: {
          employeeId,
          date: {
            gte: dateFrom,
            lte: dateTo
          }
        },
        include: { employee: true, payRun: true },
        orderBy: { date: 'asc' }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  async lockDaySummariesForPayRun(payRunId: number) {
    const prismaClient = this.getPrismaClient();
    try {
      return await prismaClient.daySummary.updateMany({
        where: { payRunId },
        data: {
          locked: true,
          status: 'LOCKED',
          updatedAt: new Date()
        }
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }

  // Enhanced filtering methods
  async findAllWithFilters(filters?: {
    employeeId?: number;
    entrepriseId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    status?: AttendanceStatus;
    approvalStatus?: AttendanceApprovalStatus;
    createdById?: number;
  }): Promise<Attendance[]> {
    const prismaClient = this.getPrismaClient();
    try {
      const where: any = {};

      if (filters?.employeeId) {
        where.employeeId = filters.employeeId;
      }

      if (filters?.entrepriseId) {
        where.employee = {
          entrepriseId: filters.entrepriseId
        };
      }

      if (filters?.dateFrom || filters?.dateTo) {
        where.date = {};
        if (filters.dateFrom) {
          where.date.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.date.lte = filters.dateTo;
        }
      }

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.approvalStatus) {
        where.approvalStatus = filters.approvalStatus;
      }

      if (filters?.createdById) {
        where.createdById = filters.createdById;
      }

      return await prismaClient.attendance.findMany({
        where,
        include: {
          employee: {
            include: { entreprise: true }
          },
          createdBy: true,
          approvedBy: true,
          audits: {
            include: { performedBy: true },
            orderBy: { performedAt: 'desc' }
          }
        },
        orderBy: [
          { date: 'desc' },
          { employee: { nomComplet: 'asc' } }
        ],
      });
    } finally {
      await prismaClient.$disconnect();
    }
  }
}