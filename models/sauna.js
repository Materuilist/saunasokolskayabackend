const mongoose = require('mongoose');

const saunaSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    feedback:[
        {
            type:mongoose.Types.ObjectId,
            ref: 'Feedback'
        }
    ]
});

const Sauna = mongoose.model('Sauna', saunaSchema);

module.exports = Sauna;