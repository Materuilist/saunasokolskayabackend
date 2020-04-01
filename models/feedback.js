const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    rate:{
        type:Number,
        required:true
    },
    comment:{
        type:String
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true//true
    },
    sauna:{
        type:mongoose.Types.ObjectId,
        ref:'Sauna'
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;