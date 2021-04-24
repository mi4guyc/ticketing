import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties
// that are required to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties
// that a user model has (All User settings)
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// for retrieving data from mongoose on UserDoc (User setting)
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  }, // Options
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// Looks at the password and if changed, create hash of password
// Baffling syntax
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    //    console.log(
    //      `userSchema: password of ${this.get("password")} converted to ${hashed} `
    //    );
    this.set("password", hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
