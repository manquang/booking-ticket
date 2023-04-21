const paypal = require("paypal-rest-sdk");
const nodemailer = require("nodemailer");
const User = require("../models/User.Model");

paypal.configure({
  mode: "sandbox",
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
});

var total = 0;
let mailInfo = {};

exports.createPayment = async (req, res, next) => {
  const { ticketPayment, userId } = req.body;
  mailInfo = { ticketPayment, userId };
  total = (ticketPayment.total / 23).toFixed(2);
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url: `http://localhost:${process.env.PORT}/api/v1/payment/execute`,
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
};

exports.executePayment = async (req, res, next) => {
  console.log(mailInfo);
  const user = await User.findById(mailInfo.userId);
  const tickets = mailInfo.ticketPayment;
  let config = {
    service: "gmail",
    auth: {
      user: `${process.env.EMAIL}`,
      pass: `${process.env.EMAILPASS}`,
    },
  };
  let transporter = nodemailer.createTransport(config);
  await transporter.sendMail({
    from: "reactflix.cinema@gmail.com",
    to: user.email,
    subject: "Thanh toán thành công",
    html: `
      <p>Bạn đã thanh toán thành công.</p>
      <p>Bộ phim: <strong>${tickets.nameMovie}</strong></p>
      <p>Ghế ngồi: <strong>${tickets.seats}</strong></p>
      <p>Thời gian bắt đầu: <strong>${tickets.startTime}</strong></p>
      <p>Ngày: <strong>${tickets.startDate}</strong></p>
      <p>Giá : <strong>${tickets.total * 1000} VNĐ</strong></p>
      <img src=${tickets.imgMovie} width="1000" height="600"/>
    `,
  });
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
};

exports.refundPayment = async (req, res, next) => {
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
};
