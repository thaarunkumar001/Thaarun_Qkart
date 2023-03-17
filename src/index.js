import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from '@mui/material';
import theme  from './theme.js';
import { BrowserRouter } from "react-router-dom";


// TODO: CRIO_TASK_MODULE_REGISTER - Add Target container ID (refer public/index.html)
ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
        <SnackbarProvider
          maxSnack={1}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          preventDuplicate
        >
        <ThemeProvider theme={theme}>

          <App/>
          </ThemeProvider>

        </SnackbarProvider>
        </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
