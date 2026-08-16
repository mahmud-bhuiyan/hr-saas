export const MY_BASE_PATH = "/my";

export const MY_DASHBOARD_PATH = "/my/dashboard";

export const MY_PROFILE_PATH = "/my/profile";

export const MY_ATTENDANCE_PATH = "/my/attendance";

export const MY_LEAVE_PATH = "/my/leave";

export const MY_TIMESHEETS_PATH = "/my/timesheets";

export const MY_ROTAS_PATH = "/my/rotas";

export const MY_DOCUMENTS_PATH = "/my/documents";

export const isMyPersonalSectionPath = (pathname: string): boolean =>
  pathname.startsWith(MY_ATTENDANCE_PATH) || pathname.startsWith(MY_LEAVE_PATH);
