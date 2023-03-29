const User = require("../models/User.Model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const nodemailer = require("nodemailer");
const rn = require("random-number");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
exports.register = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const err = new Error("Email đã tồn tại ! Vui lòng thử lại");
      err.statusCode = 400;
      return next(err);
    } else {
      const user = await User.create(req.body);
      const token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);
      res.status(200).json({
        user,
        token,
      });
    }
  } catch (error) {
    res.json(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }); //kiểm tra email
    if (!user) {
      const err = new Error("Email không chính xác - Vui lòng nhập lại");
      err.statusCode = 400;
      return next(err);
    }
    if (bcrypt.compareSync(req.body.password, user.password)) {
      //so sánh pw user nhập vào và pw (hash) in db
      const token = jwt.sign({ userId: user._id }, process.env.APP_SECRET);
      res.status(200).json({
        token,
        userName: user.name,
        userId: user._id,
        userPosition: user.position,
      });
    } else {
      const err = new Error("Mật khẩu không chính xác - Vui lòng nhập lại");
      err.statusCode = 400;
      return next(err);
    }
  } catch (error) {
    res.json(error);
  }
};

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.getAllUser = async (req, res, next) => {
  const usersCount = await User.countDocuments();
  try {
    const users = await User.find({});
    res.status(200).json({ users, usersCount });
  } catch (error) {
    res.json(error);
  }
};

exports.getAllUserByTime = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          users: { $push: '$$ROOT' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $group: {
          _id: '$_id.year',
          count: { $sum: '$count' },
          months: {
            $push: {
              month: '$_id.month',
              count: '$count',
              // users: '$users'
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, year: '$_id', count: 1, months: 1 } }
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOneUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    res.json(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(userId, { ...req.body });
    res.status(200).json(user);
  } catch (error) {
    res.json(error);
  }
};

exports.changePasswordUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (bcrypt.compareSync(req.body.passwordCurrent, user.password)) {
      user.password = req.body.passwordNew;
      user.save();
      res.status(200).json(user);
    } else {
      const err = new Error("Mật khẩu hiện tại không đúng");
      err.statusCode = 400;
      return next(err);
    }
  } catch (error) {
    res.json(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const err = new Error("Email không chính xác hoặc không tồn tại");
      err.statusCode = 400;
      return next(err);
    }
    const options = {
      min: 10000,
      max: 99999,
      integer: true,
    };
    const code = rn(options);
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
      to: email,
      subject: "React Flix Account",
      text: `
      Chào bạn! bạn có phải là người muốn reset password này không?\
      Hãy sử dụng mã code này để cập nhật lại mật khẩu cho tài khoản ${email}\n
      Đây là mã code của bạn: ${code}\
      Cảm ơn,\
      React Flix Cinema
    `,
    });
    res.status(200).json({ code: code });
  } catch (error) {
    console.log(error);
  }
};

exports.updateNewPasswordUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      user.password = req.body.password;
      user.save();
      res.status(200).json(user);
    }
  } catch (error) {
    res.json(error);
  }
};
