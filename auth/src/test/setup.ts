import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";

let mongo: any;

declare global {
  namespace NodeJS {
    interface Global {
      signup(): Promise<string[]>;
    }
  }
}

// Before anything runs, do this first
beforeAll(async () => {
  //Set the JWT secret for testing
  process.env.JWT_KEY = "SomeKeyValue";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //    useCreateIndex: true,
  });
});

// Before each test run clear the database of all collections
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// After all of the tests are done, shut down Mongo
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// Global function available to all test files
// Need to extend global
global.signup = async () => {
  const email = "test@test.com";
  const password = "password";

  // Test code
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password })
    .expect(201);

  const cookie = response.get("Set-Cookie");
  return cookie;
};
