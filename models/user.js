const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    phone:{
        type:Number,
        required:true
    },
    feedback:[{
        type:mongoose.Types.ObjectId,
        ref:'Feedback'
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;