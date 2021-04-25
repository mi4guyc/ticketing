import express from "express";
require("express-async-errors");
import { json } from "body-parser";
import { createChargeRouter } from "../src/routes/new";

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
app.use(createChargeRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
