const express = require("express");
const {
  RegisterUser,
  VerifyOtp,
  GetUser,
  loginUser,
  logOut,
  forgotPassword,
  chnangePassword,
  resetPassword,
  allUser,
  updateProfile,
  resendOtp,
  sendFeedback,
  getAllFeedbacks,
} = require("../Controllers/UserController");


const UserAuth = require("../Middleware/UserMiddleware");
const { body } = require("express-validator");

const route = express.Router();

route.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  RegisterUser
);
route.post("/verify-otp", VerifyOtp);
route.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  loginUser
);
route.get("/get-user", UserAuth, GetUser);
route.post("/change-password/:id", UserAuth, chnangePassword);
route.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Invalid email")],
  forgotPassword
);
route.post("/resend-otp", resendOtp);
route.post("/reset-password", resetPassword);
route.get("/logout", UserAuth, logOut);
route.get("/all-users", UserAuth, allUser);
route.put("/update-profile/:id", UserAuth, updateProfile);
route.delete("/delete-user/:id", UserAuth, deleteUser);
route.post('/feedback', [
  body("email")
    .isEmail()
    .withMessage("Invalid email"),

  body("name")
    .notEmpty()
    .withMessage("Name is required"),

  body("subject")
    .notEmpty()
    .withMessage("Subject is required"),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
],sendFeedback)

route.get('/get-feedback',UserAuth,getAllFeedbacks)

module.exports = route;
