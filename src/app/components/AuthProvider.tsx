"use client";

import {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from "react";
import Keycloak, { KeycloakInstance } from "keycloak-js";
import { config } from "./../utils/config";

interface AuthContextProps {
  keycloak: KeycloakInstance | null;
  authenticated: boolean;
  loading: boolean;
  token: string | null;
  username: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  keycloak: null,
  authenticated: false,
  loading: true,
  token: null,
  username: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [keycloak, setKeycloak] = useState<KeycloakInstance | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const kc = new Keycloak({
      url: config.KC_URL,
      realm: config.KC_REALM,
      clientId: config.KC_CLIENT_ID,
    });

    kc.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      pkceMethod: "S256",
      checkLoginIframe: true,
    })
      .then((auth) => {
        setKeycloak(kc);
        if (auth) {
          updateAuthState(kc, true);
        } else {
          // Если silent login не удался, не редиректим, просто устанавливаем состояние
          setAuthenticated(false);
          setLoading(false);
        }
      })
      .catch(() => {
        setAuthenticated(false);
        setLoading(false);
      });
  }, []);

  const updateAuthState = (kc: KeycloakInstance, auth: boolean) => {
    setAuthenticated(auth);
    setToken(kc.token || null);
    setUsername(kc.tokenParsed?.preferred_username || null);

    setLoading(false);

    // Установка таймера для обновления токена
    if (auth) {
      setInterval(() => {
        kc.updateToken(30).then((refreshed) => {
          if (refreshed) {
            setToken(kc.token || null);
            setUsername(kc.tokenParsed?.preferred_username || null);
          }
        });
      }, 30000);
    }
  };

  const login = () => {
    keycloak?.login({ redirectUri: window.location.origin });
  };

  const logout = () => {
    keycloak?.logout({ redirectUri: window.location.origin });

    // Очистка состояния
    setToken(null);
    setUsername(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        keycloak,
        authenticated,
        loading,
        token,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
