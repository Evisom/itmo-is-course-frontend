import {
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import "./Login.scss";

export const Login = () => {
  const [uzbek, setUzbek] = useState(false);
  const { login } = useAuth();
  return (
    <div
      className="container"
      style={{
        background:
          'url("https://dunduk-culinar.ru/wp-content/uploads/2017/05/4350.jpg")',
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 100%",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Card sx={{ padding: 6 }}>
        <div>
          <Typography variant="h3">Добро пожаловать</Typography>
          <Typography variant="overline">
            BooBook - узбекская благотворительная библиотека
          </Typography>
        </div>
        <div className="controls">
          <Button
            variant="outlined"
            size="large"
            onClick={login}
            disabled={!uzbek}
          >
            Войти с помощью Keycloak
          </Button>
          <FormControlLabel
            control={
              <Checkbox checked={uzbek} onClick={() => setUzbek(!uzbek)} />
            }
            label="я узбек"
          />
        </div>
      </Card>
    </div>
  );
};
