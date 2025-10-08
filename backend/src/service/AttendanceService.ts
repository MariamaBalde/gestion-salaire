import { AttendanceRepository } from "../repository/AttendanceRepository.js";
import { EmployeeRepository } from "../repository/EmployeeRepository.js";
import type { Attendance, AttendanceStatus, AttendanceApprovalStatus, DaySummaryStatus } from "@prisma/client";

export class AttendanceService {
  private attendanceRepository = new AttendanceRepository();
  private employeeRepository = new EmployeeRepository();

  async create(
    data: Omit<Attendance, "id" | "createdAt" | "updatedAt" | "hoursWorked"> & {
      checkInTime?: string | Date | null;
      checkOutTime?: string | Date | null;
      date?: string | Date;
    },
    userId: number
  ): Promise<Attendance> {
    // Validate employee exists and belongs to user's enterprise
    const employee = await this.employeeRepository.findById(data.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Convert date string to Date object if needed
    const attendanceDate = typeof data.date === 'string' ? new Date(data.date) : data.date || new Date();

    // Check if attendance already exists for this employee and date
    const existingAttendance = await this.attendanceRepository.findByEmployeeAndDate(
      data.employeeId,
      attendanceDate
    );
    if (existingAttendance) {
      throw new Error("Attendance already exists for this employee on this date");
    }

    // Convert time strings to Date objects
    let checkInTime: Date | null = null;
    let checkOutTime: Date | null = null;

    if (data.checkInTime) {
      checkInTime = this.convertTimeToDate(attendanceDate, data.checkInTime);
    }

    if (data.checkOutTime) {
      checkOutTime = this.convertTimeToDate(attendanceDate, data.checkOutTime);
    }

    // Calculate hours worked if both check-in and check-out are provided
    let hoursWorked: number | undefined;
    if (checkInTime && checkOutTime) {
      hoursWorked = this.calculateHoursWorked(checkInTime, checkOutTime);
    }

    return this.attendanceRepository.create({
      ...data,
      date: attendanceDate,
      checkInTime,
      checkOutTime,
      hoursWorked: hoursWorked || null,
      createdById: userId,
    });
  }

  async checkIn(employeeId: number, userId: number): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await this.attendanceRepository.findByEmployeeAndDate(employeeId, today);
    if (existingAttendance) {
      throw new Error("Employee already checked in today");
    }

    const now = new Date();
    return this.create({
      employeeId,
      date: today,
      checkInTime: now,
      checkOutTime: null,
      breakStartTime: null,
      breakEndTime: null,
      breakHours: null,
      overtimeHours: null,
      status: 'PRESENT',
      approvalStatus: 'PENDING',
      notes: null,
      justification: null,
      approvedById: null,
      approvedAt: null,
      createdById: userId,
    }, userId);
  }

  async checkOut(employeeId: number): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.attendanceRepository.findByEmployeeAndDate(employeeId, today);
    if (!attendance) {
      throw new Error("No check-in record found for today");
    }

    if (attendance.checkOutTime) {
      throw new Error("Employee already checked out today");
    }

    const now = new Date();
    const hoursWorked = this.calculateHoursWorked(attendance.checkInTime!, now);

    return this.attendanceRepository.update(attendance.id, {
      checkOutTime: now,
      hoursWorked,
    });
  }

  async findById(id: number): Promise<Attendance | null> {
    return this.attendanceRepository.findById(id);
  }

  async findAll(filters?: {
    employeeId?: number;
    entrepriseId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    status?: AttendanceStatus;
    createdById?: number;
  }): Promise<Attendance[]> {
    return this.attendanceRepository.findAll(filters);
  }

  async update(
    id: number,
    data: Partial<Omit<Attendance, "id" | "createdAt" | "updatedAt">>
  ): Promise<Attendance> {
    const attendance = await this.findById(id);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    // Recalculate hours worked if check-in or check-out times changed
    let hoursWorked = attendance.hoursWorked;
    if ((data.checkInTime || data.checkOutTime) && attendance.checkInTime && attendance.checkOutTime) {
      const checkInTime = data.checkInTime || attendance.checkInTime;
      const checkOutTime = data.checkOutTime || attendance.checkOutTime;
      hoursWorked = this.calculateHoursWorked(checkInTime, checkOutTime);
    }

    return this.attendanceRepository.update(id, {
      ...data,
      hoursWorked,
    });
  }

  async delete(id: number): Promise<Attendance> {
    return this.attendanceRepository.delete(id);
  }

  async bulkCreate(attendances: Omit<Attendance, "id" | "createdAt" | "updatedAt" | "hoursWorked">[], userId: number): Promise<Attendance[]> {
    // Validate all employees exist and calculate hours worked
    const validatedAttendances = await Promise.all(
      attendances.map(async (attendance) => {
        const employee = await this.employeeRepository.findById(attendance.employeeId);
        if (!employee) {
          throw new Error(`Employee ${attendance.employeeId} not found`);
        }

        let hoursWorked: number | undefined;
        if (attendance.checkInTime && attendance.checkOutTime) {
          hoursWorked = this.calculateHoursWorked(attendance.checkInTime, attendance.checkOutTime);
        }

        return {
          ...attendance,
          hoursWorked: hoursWorked || null,
          createdById: userId,
        };
      })
    );

    return this.attendanceRepository.bulkCreate(validatedAttendances);
  }

  async getAttendanceStats(employeeId: number, dateFrom: Date, dateTo: Date) {
    return this.attendanceRepository.getAttendanceStats(employeeId, dateFrom, dateTo);
  }

  async getMonthlyReport(entrepriseId: number, year: number, month: number) {
    const dateFrom = new Date(year, month - 1, 1);
    const dateTo = new Date(year, month, 0); // Last day of month

    const attendances = await this.findAll({
      entrepriseId,
      dateFrom,
      dateTo,
    });

    // Group by employee
    const report = attendances.reduce((acc, attendance) => {
      const employeeId = attendance.employeeId;
      if (!acc[employeeId]) {
        acc[employeeId] = {
          employee: (attendance as any).employee,
          attendances: [],
          stats: {
            totalDays: 0,
            presentDays: 0,
            absentDays: 0,
            lateDays: 0,
            leaveDays: 0,
            totalHours: 0
          }
        };
      }

      acc[employeeId].attendances.push(attendance);

      // Update stats
      acc[employeeId].stats.totalDays++;
      switch (attendance.status) {
        case 'PRESENT':
          acc[employeeId].stats.presentDays++;
          break;
        case 'ABSENT':
          acc[employeeId].stats.absentDays++;
          break;
        case 'RETARD':
          acc[employeeId].stats.lateDays++;
          break;
        case 'CONGE':
        case 'MALADIE':
          acc[employeeId].stats.leaveDays++;
          break;
      }
      acc[employeeId].stats.totalHours += attendance.hoursWorked || 0;

      return acc;
    }, {} as Record<number, any>);

    return Object.values(report);
  }

  private calculateHoursWorked(checkInTime: Date, checkOutTime: Date): number {
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    // Round to 2 decimal places
    return Math.round(diffHours * 100) / 100;
  }

  private convertTimeToDate(date: Date, time: string | Date): Date {
    if (time instanceof Date) {
      return time;
    }

    // time is a string like "09:30"
    const parts = time.split(':');
    const hours = parseInt(parts[0] || '0', 10);
    const minutes = parseInt(parts[1] || '0', 10);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  }

  // Break management methods
  async startBreak(attendanceId: number, userId: number): Promise<Attendance> {
    const attendance = await this.findById(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    if (!attendance.checkInTime) {
      throw new Error("Cannot start break without check-in");
    }

    if (attendance.breakStartTime && !attendance.breakEndTime) {
      throw new Error("Break already started");
    }

    // Create audit log
    await this.attendanceRepository.createAuditLog(attendanceId, 'BREAK_START', userId, null, { breakStartTime: new Date() });

    return this.attendanceRepository.startBreak(attendanceId, userId);
  }

  async endBreak(attendanceId: number, userId: number): Promise<Attendance> {
    const attendance = await this.findById(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    if (!attendance.breakStartTime) {
      throw new Error("No break started");
    }

    if (attendance.breakEndTime) {
      throw new Error("Break already ended");
    }

    const breakEndTime = new Date();
    const breakHours = this.calculateHoursWorked(attendance.breakStartTime, breakEndTime);

    // Create audit log
    await this.attendanceRepository.createAuditLog(attendanceId, 'BREAK_END', userId, null, { breakEndTime, breakHours });

    const updatedAttendance = await this.attendanceRepository.endBreak(attendanceId, userId);

    // Recalculate total hours worked
    if (updatedAttendance.checkInTime && updatedAttendance.checkOutTime) {
      const totalHours = this.calculateHoursWorked(updatedAttendance.checkInTime, updatedAttendance.checkOutTime);
      const netHours = totalHours - (updatedAttendance.breakHours || 0);

      return this.attendanceRepository.update(attendanceId, {
        hoursWorked: netHours,
        breakHours: updatedAttendance.breakHours
      });
    }

    return updatedAttendance;
  }

  // Approval workflow methods
  async approveAttendance(attendanceId: number, approvedById: number, justification: string | undefined): Promise<Attendance> {
    const attendance = await this.findById(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    // Create audit log
    await this.attendanceRepository.createAuditLog(attendanceId, 'APPROVE', approvedById, { approvalStatus: attendance.approvalStatus }, { approvalStatus: 'APPROVED' }, justification);

    return this.attendanceRepository.approveAttendance(attendanceId, approvedById, justification);
  }

  async rejectAttendance(attendanceId: number, approvedById: number, justification: string | undefined): Promise<Attendance> {
    const attendance = await this.findById(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    // Create audit log
    await this.attendanceRepository.createAuditLog(attendanceId, 'REJECT', approvedById, { approvalStatus: attendance.approvalStatus }, { approvalStatus: 'REJECTED' }, justification);

    return this.attendanceRepository.rejectAttendance(attendanceId, approvedById, justification);
  }

  async correctAttendance(attendanceId: number, correctionData: Partial<Attendance>, correctedById: number, justification: string | undefined): Promise<Attendance> {
    const attendance = await this.findById(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    // Create audit log with old and new values
    await this.attendanceRepository.createAuditLog(attendanceId, 'CORRECT', correctedById, attendance, { ...attendance, ...correctionData }, justification);

    return this.attendanceRepository.correctAttendance(attendanceId, correctionData, correctedById, justification);
  }

  // Day summary calculations
  async calculateDaySummary(employeeId: number, date: Date): Promise<any> {
    const attendances = await this.attendanceRepository.findAll({
      employeeId,
      dateFrom: date,
      dateTo: date
    });

    if (attendances.length === 0) {
      return null;
    }

    const attendance = attendances[0];
    if (!attendance) {
      return null;
    }

    const employee = await this.employeeRepository.findById(employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Calculate totals
    let totalHours = attendance.hoursWorked || 0;
    let regularHours = 0;
    let overtimeHours = attendance.overtimeHours || 0;
    let breakHours = attendance.breakHours || 0;

    // For journaliers: calculate based on contract
    if (employee.typeContrat === 'JOURNALIER') {
      // Assuming 8 hours is regular for journaliers
      const scheduledHours = 8;
      regularHours = Math.min(totalHours, scheduledHours);
      overtimeHours = Math.max(0, totalHours - scheduledHours);
    } else {
      // For fixed salary, overtime is already calculated
      regularHours = totalHours - overtimeHours;
    }

    return {
      employeeId,
      date,
      totalHours,
      regularHours,
      overtimeHours,
      breakHours,
      status: attendance.approvalStatus === 'APPROVED' ? 'APPROVED' : 'PENDING',
      notes: attendance.notes
    };
  }

  async generateDaySummariesForPeriod(employeeId: number, startDate: Date, endDate: Date): Promise<void> {
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const summary = await this.calculateDaySummary(employeeId, new Date(currentDate));
      if (summary) {
        await this.attendanceRepository.createOrUpdateDaySummary(employeeId, new Date(currentDate), summary);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  async getDaySummaries(employeeId: number, dateFrom: Date, dateTo: Date) {
    return this.attendanceRepository.getDaySummaries(employeeId, dateFrom, dateTo);
  }

  // PayRun integration
  async lockDaySummariesForPayRun(payRunId: number): Promise<void> {
    await this.attendanceRepository.lockDaySummariesForPayRun(payRunId);
  }

  // Enhanced filtering
  async findAllWithFilters(filters?: {
    employeeId?: number;
    entrepriseId?: number;
    dateFrom?: Date;
    dateTo?: Date;
    status?: AttendanceStatus;
    approvalStatus?: AttendanceApprovalStatus;
    createdById?: number;
  }): Promise<Attendance[]> {
    return this.attendanceRepository.findAllWithFilters(filters);
  }

  // Audit trail
  async getAuditTrail(attendanceId: number) {
    return this.attendanceRepository.getAuditTrail(attendanceId);
  }
}