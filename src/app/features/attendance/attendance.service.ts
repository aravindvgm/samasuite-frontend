import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

// ── Domain types ──────────────────────────────────────────────────────────────

export interface RosterStudent {
  student_id:    string;
  enrollment_id: string;
  first_name:    string;
  last_name:     string;
  status:        'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null;
}

export interface SectionRoster {
  sectionName: string;
  className:   string;
  date:        string;
  students:    RosterStudent[];
}

export interface BulkRecord {
  studentId:    string;
  enrollmentId: string;
  status:       'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export interface AttendanceDay {
  attendance_date: string;
  status:          'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
}

export interface DashboardData {
  date:              string;
  totalStudents:     number;
  presentCount:      number;
  absentCount:       number;
  attendancePercent: number;
  repeatAbsentees:   RepeatAbsentee[];
}

export interface RepeatAbsentee {
  student_id:  string;
  first_name:  string;
  last_name:   string;
  absent_days: number;
}

export interface ClassItem {
  id:   string;
  name: string;
}

export interface SectionItem {
  id:       string;
  class_id: string;
  name:     string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AttendanceService {

  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private get orgId(): string {
    return this.auth.getCurrentOrgId() ?? '';
  }

  private base(path: string): string {
    return `/api/${this.orgId}/${path}`;
  }

  // ── Classes & sections (for teacher picker) ──────────────────────────────

  getClasses(): Observable<ClassItem[]> {
    return this.http.get<{ success: boolean; data: ClassItem[] }>(
      this.base('classes')
    ).pipe(map(r => r.data));
  }

  getSections(classId: string): Observable<SectionItem[]> {
    return this.http.get<{ success: boolean; data: SectionItem[] }>(
      this.base(`classes/${classId}/sections`)
    ).pipe(map(r => r.data));
  }

  // ── Attendance endpoints ─────────────────────────────────────────────────

  /** Load teacher roster: enrolled students + today's attendance status. */
  getSectionRoster(sectionId: string, date: string): Observable<SectionRoster> {
    return this.http.get<{ success: boolean; data: SectionRoster }>(
      this.base(`attendance/section/${sectionId}`),
      { params: { date } }
    ).pipe(map(r => r.data));
  }

  /** Bulk mark attendance — idempotent, safe to retry. */
  bulkMark(sectionId: string, date: string, records: BulkRecord[]): Observable<{ saved: number }> {
    return this.http.post<{ success: boolean; saved: number }>(
      this.base('attendance/bulk'),
      { sectionId, date, records }
    ).pipe(map(r => ({ saved: r.saved })));
  }

  /** Parent view: last 7 days for one student. */
  getStudentHistory(studentId: string): Observable<AttendanceDay[]> {
    return this.http.get<{ success: boolean; data: AttendanceDay[] }>(
      this.base(`attendance/student/${studentId}`)
    ).pipe(map(r => r.data));
  }

  /** Principal dashboard: stats + repeat absentees. */
  getDashboard(date?: string): Observable<DashboardData> {
    const params = date ? { date } : {};
    return this.http.get<{ success: boolean; data: DashboardData }>(
      this.base('attendance/dashboard'),
      { params }
    ).pipe(map(r => r.data));
  }
}
