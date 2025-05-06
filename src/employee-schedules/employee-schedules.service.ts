import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database.service';

@Injectable()
export class EmployeeSchedulesService {
  constructor(private readonly dbService: DatabaseService) {}

  async createShift(startTime: string, endTime: string) {
    const [result] = await this.dbService.connection.query(
      'INSERT INTO WorkShift (start_time, end_time) VALUES (?, ?)',
      [startTime, endTime],
    );
    return {
      id: (result as any).insertId,
      start_time: startTime,
      end_time: endTime,
    };
  }

  async assignShift(employeeId: number, shiftId: number, workDate: string) {
    try {
      const [result] = await this.dbService.connection.query(
        `INSERT INTO EmployeeSchedule (employee_id, shift_id, work_date)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE shift_id = VALUES(shift_id)`,
        [employeeId, shiftId, workDate],
      );
      return result;
    } catch (error) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new Error('Invalid employee_id or shift_id');
      }
      throw error;
    }
  }

  async getEmployeeSchedule(
    employeeId: number,
    startDate: string,
    endDate: string,
  ) {
    const [schedule] = await this.dbService.connection.query(
      `SELECT 
        es.id, 
        es.work_date, 
        ws.start_time, 
        ws.end_time 
       FROM EmployeeSchedule es
       JOIN WorkShift ws ON es.shift_id = ws.id
       WHERE es.employee_id = ? 
         AND es.work_date BETWEEN ? AND ?
       ORDER BY es.work_date ASC`,
      [employeeId, startDate, endDate],
    );
    return schedule;
  }

  async getShifts() {
    const [shifts] = await this.dbService.connection.query(
      'SELECT * FROM WorkShift ORDER BY start_time',
    );
    return shifts;
  }

  async deleteAssignment(assignmentId: number) {
    const [result] = await this.dbService.connection.query(
      'DELETE FROM EmployeeSchedule WHERE id = ?',
      [assignmentId],
    );
    return result;
  }
}
