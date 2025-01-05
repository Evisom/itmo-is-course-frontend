import { Button, Checkbox, FormControlLabel, Typography } from "@mui/material";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import "./Login.scss";

export const Login = () => {
  const [uzbek, setUzbek] = useState(false);
  const { login } = useAuth();
  return (
    <div className="container">
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
    </div>
  );
};
