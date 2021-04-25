import express from "express";
require("express-async-errors");
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "@mi3guyc/common";
import { NotFoundError } from "@mi3guyc/common";

import cookieSession from "cookie-session";

const app = express();
// Behind Ingress - tell Express not to freak out
app.set("trust proxy", true);

app.use(json());

// Not encrypted / use https
app.use(
  cookieSession({
    signed: false,
    // Disable this line for testing with http:
    // secure: process.env.NODE_ENV != "test",
    //      secure: true,
    //  *** BAD BAD BAD Turning off TLS ***
    secure: false,
  })
);

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
