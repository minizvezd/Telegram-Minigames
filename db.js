const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    user_id: {type: Number, required: true},
    username: {type: String},
    game_type: {type: String, required: true},
    score: {type: Number, required: true},
    date: {type: Date, default: Date.now}
});

const Record = mongoose.model('Record', recordSchema);

async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/my_games');
        console.log("MongoDB connected")
    } catch(error) {
        console.error("Database connection error: ", error);
    }
}

module.exports = {Record, connectDB};