const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Feedback = require("../models/feedback");
const Sauna = require("../models/sauna");

const ITEMS_PER_PAGE = 2;

router.get("/:sauna", async (req, res, next) => {
  const sauna = await Sauna.findOne({
    title: req.params.sauna
  });
  let feedback;
  let nextPageExists = false;
  if (+req.query.page >= 1) {
    feedback = await Feedback.find({ sauna: sauna.id })
      .skip((+req.query.page - 1) * (+req.query.items || ITEMS_PER_PAGE))
      .limit(+req.query.items || ITEMS_PER_PAGE);
    nextPageExists =
      (await Feedback.count({ sauna: sauna.id })) >
      +req.query.page * (+req.query.items || ITEMS_PER_PAGE);
  } else {
    feedback = await Feedback.find({
      sauna: sauna.id
    });
  }
  let result = await Promise.all(
    feedback.map(feed => feed.populate("user").execPopulate())
  );
  result = result.map(nonFilteredDoc => {
    let newDoc = JSON.parse(JSON.stringify(nonFilteredDoc));
    newDoc.user = nonFilteredDoc.user.name;
    return newDoc;
  });
  await res.status(200).json({ feedback: result, nextPageExists });
});

router.post(
  "/:sauna",
  [
    check("rate").isFloat({ gt: 0, max: 5 }),
    check("comment")
      .isString()
      .isLength({ min: 5 })
  ],
  async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
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
    const { name, phone } = parsedToken;
    const user = await User.findOne({ name, phone });
    if (!user) {
      next({
        status: 401,
        message: "Извините, но отзывы могут оставлять только посетители сауны!"
      });
      return;
    }
    const currentSauna = await Sauna.findOne({
      title: req.params.sauna
    });
    //уже оставлял отзыв об этой сауне
    const feedbackOnThisSaunaExists =
      (await Feedback.findOne({
        sauna: currentSauna.id,
        user: user.id
      })) !== null;
    if (feedbackOnThisSaunaExists) {
      next({ status: 400, message: "Вы уже оставили отзыв об этой сауне!" });
      return;
    }

    const { rate, comment } = req.body;

    try {
      const newFeedback = await Feedback.create({
        rate,
        comment,
        user: user.id,
        sauna: currentSauna.id
      });

      currentSauna.feedback.push(newFeedback.id);
      await currentSauna.save();

      user.feedback.push(newFeedback.id);
      await user.save();

      //просто так
      await res.status(201).json({ rate: newFeedback.rate });
    } catch (error) {
      next({
        status: 500,
        message: "Что-то пошло не так...Извините за предоставленные неудобства"
      });
      return;
    }
  }
);

module.exports = router;
