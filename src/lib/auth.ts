export type AuthRole = "super_admin" | "factory_admin" | "employee";

export type AuthFactory = {
  id: string;
  name: string;
  code: string;
  status?: string;
};

export type AuthMembership = {
  id: string;
  role: "factory_admin" | "employee";
  employeeRole?: string;
  status: string;
  factory: AuthFactory;
};

export type AuthProfile = {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  globalRole: "super_admin" | "factory_user";
};

export type AuthSession = {
  token: string;
  profile: AuthProfile;
  primaryRole?: "super_admin" | "admin" | "employee";
  memberships: AuthMembership[];
};

const SUPER_ADMIN_EMAIL = "ads.grandcafe@gmail.com";
const TOKEN_KEY = "factrova-auth-token";
const SESSION_KEY = "factrova-auth-session";
const FACTORY_KEY = "factrova-active-factory-id";

function isSuperAdminEmail(email?: string) {
  return email?.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function getActiveFactoryId() {
  const saved = localStorage.getItem(FACTORY_KEY);
  if (saved) return saved;
  return getAuthSession()?.memberships[0]?.factory?.id ?? null;
}

function getPrimaryMembership(session: AuthSession) {
  return session.memberships.find((membership) => membership.role === "employee")
    ?? session.memberships[0]
    ?? null;
}

export function saveAuthSession(session: AuthSession) {
  const normalizedSession: AuthSession = isSuperAdminEmail(session.profile.email)
    ? {
        ...session,
        profile: {
          ...session.profile,
          globalRole: "super_admin",
        },
        primaryRole: "super_admin",
      }
    : session;

  localStorage.setItem(TOKEN_KEY, normalizedSession.token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(normalizedSession));

  const primaryMembership = getPrimaryMembership(normalizedSession);
  if (primaryMembership?.factory?.id) {
    localStorage.setItem(FACTORY_KEY, primaryMembership.factory.id);
  }

  const appRole: "admin" | "employee" =
    normalizedSession.primaryRole === "employee" || primaryMembership?.role === "employee" ? "employee" : "admin";
  localStorage.setItem("factrova-login-role", appRole);
  localStorage.setItem("factrova-profile-name", normalizedSession.profile.fullName || normalizedSession.profile.email);
  localStorage.setItem("factrova-profile-email", normalizedSession.profile.email);
  if (primaryMembership?.role === "employee") {
    localStorage.setItem("factrova-employee-name", normalizedSession.profile.fullName || normalizedSession.profile.email);
    localStorage.setItem("factrova-employee-position", primaryMembership.employeeRole || "Employee");
  } else {
    localStorage.removeItem("factrova-employee-name");
    localStorage.removeItem("factrova-employee-position");
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(FACTORY_KEY);
  localStorage.removeItem("factrova-login-role");
  localStorage.removeItem("factrova-profile-name");
  localStorage.removeItem("factrova-profile-email");
  localStorage.removeItem("factrova-employee-name");
  localStorage.removeItem("factrova-employee-position");
}

export function getHomeRoute(session = getAuthSession()) {
  if (!session) return "/";
  if (session.profile.globalRole === "super_admin") return "/Superadmin";
  return session.primaryRole === "employee" || session.memberships.some((membership) => membership.role === "employee")
    ? "/employee/dashboard"
    : "/admin/dashboard";
}
