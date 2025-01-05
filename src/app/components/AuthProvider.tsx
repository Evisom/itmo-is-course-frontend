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
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const kc = new Keycloak({
      url: config.KC_URL,
      realm: config.KC_REALM,
      clientId: config.KC_CLIENT_ID,
    });

    kc.init({ onLoad: "check-sso", pkceMethod: "S256" })
      .then((auth) => {
        setKeycloak(kc);
        setAuthenticated(auth);
        setLoading(false);
        if (auth) {
          setToken(kc.token || null);
          setUsername(kc.tokenParsed?.preferred_username || null);

          // Обновление токена каждые 30 секунд
          setInterval(() => {
            kc.updateToken(30).then((refreshed) => {
              if (refreshed) {
                setToken(kc.token || null);
                setUsername(kc.tokenParsed?.preferred_username || null);
              }
            });
          }, 30000);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const login = () => {
    keycloak?.login({ redirectUri: "http://localhost:3000" });
  };

  const logout = () => {
    keycloak?.logout({ redirectUri: "http://localhost:3000" });
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
