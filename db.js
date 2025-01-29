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
        await mongoose.connect('mongodb+srv://formersss123:WO18tYqcSD29Dzwb@cluster0.3etwv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
        console.log("MongoDB connected")
    } catch(error) {
        console.error("Database connection error: ", error);
    }
}

module.exports = {Record, connectDB};