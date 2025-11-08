import mongoose from "mongoose";

const connectDB = async() =>{
    try{
        const connectionInstace = await mongoose.connect(`${process.env.MONGO_URL}/${process.env.DB_NAME}`);
        console.log(`MONGO_DB CONNECTED !! DB_HOST: ${connectionInstace.connection.host}`);
        console.log(`DB NAME: ${process.env.DB_NAME}`);
    }catch(err){
        console.log("Mongo db connection error: "+err.message);
    }
};

export default connectDB;