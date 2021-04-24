import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    //   console.log(
    //     `Password.toHash:
    //     Password is ${password}
    //     Hash is ${buf.toString("hex")} Salt is ${salt}`
    //   );

    //  const concatenatedString = buf.toString("hex") + "." + salt;
    //  console.log("Password.toHash concat returned string:", concatenatedString);
    //  console.log("Instructor Solution:", `${buf.toString("hex")}.${salt}`);
    return `${buf.toString("hex")}.${salt}`;
  }
  static async compare(storedPassword: string, suppliedPassword: string) {
    // split the stored password
    const [hashedPassword, salt] = storedPassword.split(".");
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    //    console.log(
    //      `Password.compare: Unsplit Ref Password: ${storedPassword} User Raw Password: ${suppliedPassword} Ref Hash ${hashedPassword} Salt ${salt} Calulated User Hash ${buf.toString(
    //        "hex"
    //     )} `
    //    );

    return buf.toString("hex") === hashedPassword;
  }
}
