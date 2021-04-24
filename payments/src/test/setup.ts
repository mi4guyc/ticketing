import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../app";

let mongo: any;

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

// replace NATS Service with mock to remove dependency on NATS
jest.mock("../nats-wrapper");
// jest.mock("../stripe");
process.env.STRIPE_KEY =
  "sk_test_51Iig76J1UEE1Z8UcGqeZThyVXNy1VPv8nSAqiaiyzEp6LqoS2zxmxHwlwjjgcalh75K3sgcYhQGE81IMVkrb2laz00KuNEkoxP";

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
  jest.clearAllMocks();
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
global.signin = (id?: string) => {
  // Build JWT Payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build the session
  const session = { jwt: token };

  // Turn object into string
  const sessionJSON = JSON.stringify(session);

  // Make it base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  //Make it a cookie
  const generatedCookie = `express:sess=${base64}`;

  // cookie captured from browser
  const cookie =
    "express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJall3TmpabU5UZzVaRE5tWWpJeU1EQXlaVGt4TldVME1TSXNJbVZ0WVdsc0lqb2liV0ZwYkVCdFlXbHNMbU52YlNJc0ltbGhkQ0k2TVRZeE56TTJNREkyTlgwLkdta0pkSTgtZDVjT3k1Smp4SFFBVjB2SE1MQ0VaUERoVEYxbUJBWW0tUDgifQ==";
  return [generatedCookie];
};
