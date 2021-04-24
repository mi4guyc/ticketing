import express from "express";
require("express-async-errors");
import { json } from "body-parser";
import { createTicketRouter } from "../src/routes/new";
import { showTicketRouter } from "./routes/show";
import { listTicketRouter } from "./routes/index";
import { updateTicketRouter } from "./routes/update";

import {
  errorHandler,
  NotFoundError,
  currentUser,
  requireAuth,
} from "@mi3guyc/common";

import cookieSession from "cookie-session";

const app = express();
// Behind Ingress - tell Express not to freak out
app.set("trust proxy", true);
app.use(json());

// Not encrypted / use https
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV != "test",
    //      secure: true,
  })
);

app.use(currentUser); //Check for current user on cookie above

// Routes list...
app.use(createTicketRouter); //Create a ticket route
app.use(showTicketRouter); // Show ticket information by :ID
app.use(listTicketRouter);
app.use(updateTicketRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
