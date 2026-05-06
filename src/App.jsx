import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { authApi } from "./api/auth.api";
import AppRouter from "./Router/AppRouter";
import useAuthStore from "./store/useAuthStore";

function App() {
  const {
    isAuthenticated,
    accessToken,
    user,
    login,
    logout,
  } = useAuthStore();

  useEffect(() => {
    let ignore = false;

    const syncAuthSession = async () => {
      if (!isAuthenticated || !accessToken) return;

      try {
        const res = await authApi.getInfo();
        const serverUser = res.data || res;
        if (ignore || !serverUser) return;

        const hasChanged =
          Number(user?.id) !== Number(serverUser.id) ||
          Number(user?.roleId) !== Number(serverUser.roleId);

        if (hasChanged) {
          login(serverUser);
        }
      } catch (err) {
        if (ignore) return;
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          logout();
        }
      }
    };

    syncAuthSession();

    return () => {
      ignore = true;
    };
  }, [accessToken, isAuthenticated, login, logout, user?.id, user?.roleId]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <AppRouter />
    </>
  );
}

export default App;
