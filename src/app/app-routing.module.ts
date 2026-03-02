import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { TeacherAttendanceComponent } from './features/attendance/teacher-attendance/teacher-attendance.component';
import { ParentAttendanceComponent } from './features/attendance/parent-attendance/parent-attendance.component';
import { PrincipalDashboardComponent } from './features/attendance/principal-dashboard/principal-dashboard.component';

const routes: Routes = [
  // Attendance
  {
    path:        'attendance/teacher',
    component:   TeacherAttendanceComponent,
    canActivate: [AuthGuard],
  },
  {
    path:        'attendance/parent/:studentId',
    component:   ParentAttendanceComponent,
    canActivate: [AuthGuard],
  },
  {
    path:        'attendance/dashboard',
    component:   PrincipalDashboardComponent,
    canActivate: [AuthGuard],
  },
  // Default redirect — update once more routes exist
  { path: '', redirectTo: 'attendance/teacher', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
