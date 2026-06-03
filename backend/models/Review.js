import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    clientName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    clientRole: { 
        type: String, 
        required: true, 
        trim: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        required: true 
    }
}, {
    timestamps: true 
});

export default mongoose.model("Review", reviewSchema);