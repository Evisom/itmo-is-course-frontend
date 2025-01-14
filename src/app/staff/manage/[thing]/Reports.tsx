import { useAuth } from "@/app/components/AuthProvider";
import { config } from "@/app/utils/config";
import { fetcher } from "@/app/utils/fetcher";
import {
  Button,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateField } from "@mui/x-date-pickers/DateField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

const Reports = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { token } = useAuth();
  const isValidEmail = () =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email === "";
  const [selectedLibrary, setSelectedLibrary] = useState<number | null>(null);
  const { data: librariesData, error: librariesError } = useSWR(
    token ? [`${config.API_URL}/library/allLibraries`, token] : null,
    ([url, token]) => fetcher(url, token)
  );

  const [date, setDate] = useState("");

  const handleDateChange = (newValue: Date | null) => {
    if (newValue) {
      const formattedDate = newValue.toISOString().split("T")[0];
      setDate(formattedDate);
    } else {
      setDate("");
    }
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginTop: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6">Отчет по пользователю</Typography>
        <TextField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!isValidEmail()}
          size="large"
          label="Электронная почта"
          sx={{
            margin: "16px 0",
          }}
        ></TextField>
        <Button
          disabled={!isValidEmail() || !email}
          variant="outlined"
          size="large"
          onClick={() => router.push("/history?email=" + email)}
        >
          Создать
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6">Отчет по библиотеке</Typography>

        <Select
          value={selectedLibrary || ""}
          onChange={(e) => setSelectedLibrary(Number(e.target.value))}
          fullWidth
          size="medium"
          sx={{
            marginTop: "16px",
          }}
        >
          <MenuItem value="" disabled>
            Выберите филиал
          </MenuItem>
          {librariesData?.map((library) => (
            <MenuItem key={library.id} value={library.id}>
              {library.name}
            </MenuItem>
          ))}
        </Select>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
          <DateField
            label="Дата"
            format="yyyy-MM-dd"
            value={date ? new Date(date) : null}
            slotProps={{ textField: { error: false } }}
            onChange={handleDateChange}
            sx={{
              margin: "16px 0",
            }}
          />
        </LocalizationProvider>
        <Button
          disabled={!(selectedLibrary && date)}
          variant="outlined"
          size="large"
          onClick={() =>
            router.push(
              "/staff/manage/libraryReport?libraryId=" +
                selectedLibrary +
                "&date=" +
                date
            )
          }
        >
          Создать
        </Button>
      </div>
    </div>
  );
};
export default Reports;
