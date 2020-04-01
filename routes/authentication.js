const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/', [
    check('phone').isMobilePhone('ru-RU')
], async (req, res, next)=>{
    const validationErrors = validationResult(req);
    if(!validationErrors.isEmpty()){
        next({status:400, validationErrors});
        return;
    }
    const{name, phone} = req.body;
    const user = await User.findOne({phone});
    if(!user){
        next({status:401, message:'Извините, но клиента с таким номером телефона нет в нашей ' +
         'клиентской базе. Отзывы могут оставлять только посетители сауны!'});
         return;
    }
    if(user.feedback.length>=2){
        next({status:403, message:'Вы не можете оставить больше одного отзыва для каждой сауны!'});
        return;
    }
    if(name){
        user.name=name;
    }
    await user.save();
    const token = await jwt.sign({name:user.name, phone}, 'kiskamariskatakata',{
        expiresIn: 1800
    });
    res.status(200).json(token);
})

module.exports = router;