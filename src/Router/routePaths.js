export const ROLE_IDS = {
  admin: 1,
  staff: 2,
};

export const getDefaultRouteByRole = (roleId) =>
  Number(roleId) === ROLE_IDS.admin ? "/admin/dashboard" : "/staff/dashboard";
