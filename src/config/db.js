import mongoose from "mongoose";

const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Mongo DB Connected");
    }catch(err){
        console.log("Mongo db connection error: "+err.message);
    }
};

export default connectDB;