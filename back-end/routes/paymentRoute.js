const express = require("express");
const Router = express.Router();
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

var total = 0;

Router.post("/create-checkout-session", (req, res) => {
  const { ticketPayment, userId } = req.body;
  total = ticketPayment.total;
  console.log(total);
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `http://localhost:${process.env.PORT}/api/v1/payment/success`,
      cancel_url: `http://localhost:${process.env.CLIENT_PORT}/booking`,
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Thông tin đã đặt vé",
              sku: "item",
              price: `${total}`,
              currency: "USD",
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: "USD",
          total: `${total}`,
        },
        description: "Tên phim: " + ticketPayment.nameMovie,
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (err, payment) {
    if (err) {
      res.json(err);
    } else {
      console.log(payment.id);
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.json({ url: payment.links[i].href, paymentId: payment.id });
        }
      }
    }
  });
});

Router.get("/success", function (req, res) {
  console.log(req.query.paymentId);
  payerId = req.query.PayerID;
  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: `${total}`,
        },
      },
    ],
  };

  const paymentId = req.query.paymentId;

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        console.log(error.response);
      } else {
        console.log("Get Payment Response");
        res.writeHead(302, {
          Location: `http://localhost:${process.env.CLIENT_PORT}/checkout-success`,
        });
        res.end();
      }
    }
  );
});

Router.post("/refund", function (req, res) {
  const paymentId = req.body.paymentId;
  console.log("what the fuck " + paymentId);
  paypal.payment.get(paymentId, function (error, payment) {
    if (error) {
      console.error(error);
    } else {
      let saleId = payment.transactions[0].related_resources[0].sale.id;
      paypal.sale.refund(saleId, {}, function (error, refund) {
        if (error) {
          console.error(error);
        } else {
          res.json(refund);
        }
      });
    }
  });
});

module.exports = Router;
