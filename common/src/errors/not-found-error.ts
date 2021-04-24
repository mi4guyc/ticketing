import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  reason = "Path Not Found";
  statusCode = 404;

  constructor() {
    super("Path Not Found");

    //Only because we are extending a built-in typescript class "Error"
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: this.reason }];
  }
}
