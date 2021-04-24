import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  // Blast the cookie with the jwt
  req.session = null;
  res.send({}); // Empty object returned
});

export { router as signoutRouter };
