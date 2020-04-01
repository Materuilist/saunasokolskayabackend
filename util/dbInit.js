const bcrypt = require('bcrypt');

const User = require("../models/user");
const Feedback = require("../models/feedback");
const Sauna = require("../models/sauna");
const Admin = require('../models/admin');

module.exports = async function(){
    //clearup
    await Admin.deleteMany();
    await User.deleteMany();
    await Sauna.deleteMany();
    await Feedback.deleteMany();

    //admin
    const password = 'trulala'
    const hashedPassword = await bcrypt.hash(password, 12);
    Admin.create({
        phone:89125817044,
        password:hashedPassword
    })

    //data
    let user1 = await User.create({
        name:'Кирилл',
        phone:89125817044,
        feedback:[]
    })
    let feedback = await Feedback.create({
        rate:5,
        comment:'Блестящая сауна!',
        user:user1.id
    });
    let firstSauna = await Sauna.create({
        title:'firstSauna',
        feedback:[
            feedback.id
        ]
    });
    feedback.sauna = firstSauna.id;
    await feedback.save();
    user1.feedback.push(feedback.id);
    await user1.save();

    let user2 = await User.create({
        name:'Милануська',
        phone:89222423311,
        feedback:[]
    });
    feedback = await Feedback.create({
        rate:4,
        comment:'Хорошая сауна.',
        user:user2.id
    });
    feedback.sauna = firstSauna.id;
    await feedback.save();
    firstSauna.feedback.push(feedback.id);
    await firstSauna.save();
    user2.feedback.push(feedback.id);
    await user2.save();

    feedback = await Feedback.create({
        rate:5,
        comment:'Отличная сауна!',
        user:user2.id
    });
    secondSauna = await Sauna.create({
        title:'secondSauna',
        feedback:[
            feedback.id
        ]
    });
    feedback.sauna = secondSauna.id;
    await feedback.save();
    user2.feedback.push(feedback.id);
    await user2.save();

    let user3 = await User.create({
        name:'Borow',
        phone:89666666666,
        feedback:[]
    })
    feedback = await Feedback.create({
        rate:3,
        comment:'Пойдет сауна...',
        user:user3.id
    });
    feedback.sauna = secondSauna.id;
    await feedback.save();
    user3.feedback.push(feedback.id);
    await user3.save();
    secondSauna.feedback.push(feedback.id);
    await secondSauna.save();
}