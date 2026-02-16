# UniLife-Manager
This Repo is creating for my Academic Project as WebApps by MERN with covering full UI, Features and Functionalities.


## For Authenticating and made interactive group management system with user roles and email verification

unilife-manager/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   ├── Register.jsx
│       │   │   ├── ResetPassword.jsx
│       │   │   └── EmailVerification.jsx
│       │   └── groups/
│       │       ├── GroupDashboard.jsx
│       │       ├── CreateGroup.jsx
│       │       ├── JoinGroup.jsx
│       │       └── GroupRequests.jsx
│       ├── pages/
│       │   ├── AuthPage.jsx
│       │   └── GroupsPage.jsx
│       ├── features/
│       │   ├── auth/
│       │   └── groups/
│       ├── services/
│       │   └── api.js
│       └── App.js
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Group.js
│   │   └── GroupRequest.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── groups.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── emailService.js







## For a comprehensive system with Courses, Routine, Cost, Notes, Dashboard, and Statistics pages

unilife-manager/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── courses/
│   │   │   │   ├── AddCourse.jsx
│   │   │   │   ├── CourseList.jsx
│   │   │   │   ├── CourseCard.jsx
│   │   │   │   └── CourseForm.jsx
│   │   │   ├── routine/
│   │   │   │   ├── HabitTracker.jsx
│   │   │   │   ├── HabitForm.jsx
│   │   │   │   └── CalendarView.jsx
│   │   │   ├── cost/
│   │   │   │   ├── ExpenseTracker.jsx
│   │   │   │   ├── BudgetSetup.jsx
│   │   │   │   └── ExpenseForm.jsx
│   │   │   ├── notes/
│   │   │   │   ├── NoteEditor.jsx
│   │   │   │   ├── NoteList.jsx
│   │   │   │   ├── NoteCard.jsx
│   │   │   │   └── ShareModal.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── TodaySchedule.jsx
│   │   │   │   ├── BudgetOverview.jsx
│   │   │   │   └── ClassAttendance.jsx
│   │   │   └── statistics/
│   │   │       ├── CourseStats.jsx
│   │   │       ├── HabitStats.jsx
│   │   │       └── ExpenseStats.jsx
│   │   ├── pages/
│   │   │   ├── CoursesPage.jsx
│   │   │   ├── RoutinePage.jsx
│   │   │   ├── CostPage.jsx
│   │   │   ├── NotesPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── StatisticsPage.jsx
│   │   ├── features/
│   │   │   ├── courses/
│   │   │   │   ├── courseSlice.js
│   │   │   │   └── courseAPI.js
│   │   │   ├── routine/
│   │   │   │   ├── habitSlice.js
│   │   │   │   └── habitAPI.js
│   │   │   ├── cost/
│   │   │   │   ├── expenseSlice.js
│   │   │   │   └── expenseAPI.js
│   │   │   ├── notes/
│   │   │   │   ├── noteSlice.js
│   │   │   │   └── noteAPI.js
│   │   │   └── attendance/
│   │   │       ├── attendanceSlice.js
│   │   │       └── attendanceAPI.js
│   │   └── App.js
├── server/
│   ├── models/
│   │   ├── Course.js
│   │   ├── Routine.js
│   │   ├── Expense.js
│   │   ├── Note.js
│   │   ├── Attendance.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── courses.js
│   │   ├── routine.js
│   │   ├── expenses.js
│   │   ├── notes.js
│   │   └── dashboard.js
│   └── server.js









## For all advanced notification and automation features. Let me build this systematically.

unilife-manager/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationManager.jsx
│   │   │   │   ├── PermissionRequest.jsx
│   │   │   │   └── SilentModeToggle.jsx
│   │   │   └── noticeboard/
│   │   │       ├── NoticeBoard.jsx
│   │   │       ├── NoticeForm.jsx
│   │   │       ├── NoticeCard.jsx
│   │   │       └── FileUploader.jsx
│   │   ├── pages/
│   │   │   └── NoticeBoardPage.jsx
│   │   ├── features/
│   │   │   ├── notifications/
│   │   │   │   ├── notificationSlice.js
│   │   │   │   └── notificationAPI.js
│   │   │   └── noticeboard/
│   │   │       ├── noticeSlice.js
│   │   │       └── noticeAPI.js
│   │   ├── services/
│   │   │   ├── pushNotification.js
│   │   │   ├── silentModeService.js
│   │   │   └── backgroundTasks.js
│   │   └── App.js
├── server/
│   ├── models/
│   │   ├── Notification.js
│   │   └── Notice.js
│   ├── routes/
│   │   ├── notifications.js
│   │   └── notices.js
│   ├── services/
│   │   ├── notificationService.js
│   │   └── schedulerService.js
│   └── server.js
└── public/
    └── logo192.png (app logo for notifications)
│   └── server.js
└── package.json



