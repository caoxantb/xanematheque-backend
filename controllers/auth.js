/* eslint-disable no-undef */
const authRouter = require("express").Router();

// hash method
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// models
const User = require("../models/users/user");

// sign up
router.post("/signup", async (request, response) => {
  const { email, fullName, password } = request.body;

  if (!password || password.length < 3) {
    return response.status(400).json({
      error: "invalid password",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return response.status(400).json({
      error: "username must be unique",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    email,
    fullName,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

// login
loginRouter.post("/login", async (request, response) => {
  const body = request.body;

  const user = await User.findOne({ email: body.email });
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid email or password",
    });
  }

  const userForToken = {
    email: user.email,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60 * 24 * 7,
  });

  response
    .status(200)
    .send({ token, email: user.email, fullName: user.fullName });
});

module.exports = authRouter;
