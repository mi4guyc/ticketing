import express from "express";
require("express-async-errors");
import { json } from "body-parser";
import { newOrderRouter } from "./routes/new";
import { indexOrderRouter } from "./routes";
import { showOrderRouter } from "./routes/show";
import { deleteOrderRouter } from "./routes/delete";

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
    // secure: process.env.NODE_ENV != "test",
    //      secure: true,
    //  *** BAD BAD BAD Turning off TLS ***
    secure: false,
  })
);

app.use(currentUser); //Check for current user on cookie above

// Routes list...
app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
