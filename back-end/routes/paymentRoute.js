const express = require("express");
const Router = express.Router();
const {
  createPayment,
  executePayment,
  refundPayment,
} = require("../controllers/paymentController");

Router.route("/create").post(createPayment);
Router.route("/execute").get(executePayment);
Router.route("/refund").post(refundPayment);

module.exports = Router;
