import { CustomError } from "./custom-error";

export class NotAuthorizedError extends CustomError {
  reason = "Unauthorized Access";
  statusCode = 401;

  constructor() {
    super("Unauthorized Access");

    //Only because we are extending a built-in typescript class "Error"
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
