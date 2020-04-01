const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Admin = require("../models/admin");
const User = require('../models/user');
const Feedback = require('../models/feedback');
const Sauna = require('../models/sauna');

router.delete("/:feedbackId", async (req, res, next) => {
    const feedback = await Feedback.findByIdAndDelete(req.params.feedbackId);
    const sauna = await Sauna.findById(feedback.sauna);
    sauna.feedback.pull(feedback.id);
    await sauna.save();
    const user = await User.findById(feedback.user);
    user.feedback.pull(feedback.id);
    await user.save();
    res.status(200).json({message:'Пользователь удален!'});
});

router.post(
  "/authentication",
  [check("phone").isMobilePhone("ru-RU")],
  async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationResult(req).isEmpty()) {
      next({ status: 400, validationErrors });
      return;
    }
    const admin = await Admin.findOne({ phone: req.body.phone });
    if (!admin) {
      next({ status: 400, message: "Неверный номер телефона!" });
      return;
    }
    const passwordMatches = await bcrypt.compare(
      req.body.password,
      admin.password
    );
    if (!passwordMatches) {
      next({
        status: 403,
        message: "Неверный пароль!"
      });
      return;
    }
    const token = await jwt.sign(
      { phone: req.body.phone },
      "kiskamariskatakata",
      {
        expiresIn: 1800
      }
    );
    res.status(200).json(token);
  }
);

router.post(
  "/add-user",
  [check("phone").isMobilePhone("ru-RU")],
  async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationResult(req).isEmpty()) {
      next({ status: 400, validationErrors });
      return;
    }
    const token = req.headers.authorization.split(":")[1];
    let parsedToken;
    try {
      parsedToken = await jwt.verify(token, "kiskamariskatakata");
    } catch (error) {
      next({ status: 401, error });
      return;
    }
    const {phone} = req.body;
    let user = await User.findOne({phone});
    if(user){
        next({status:403, message:'Пользователь с таким номером уже есть'});
        return;
    }
    user = await User.create({name:'Инкогнито', phone, feedback:[]});
    res.status(201).json({message:'Пользователь успешно создан!'});
  }
);

module.exports = router;
