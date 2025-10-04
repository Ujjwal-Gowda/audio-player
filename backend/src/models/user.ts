import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name:string;
    email: string;
    hashedPassword: string;
    favorites:string[];
    themePref:"light"|"dark";
}

const userSchema = new Schema<IUser>(
    {
    name:{
        type:String,
        required:true,
    },
    email: { 
        type: String,
        required: true,
        unique: true 
    },
    hashedPassword: { 
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    favorites:{
        type:[String],
        default:[]

    },
    themePref:{
        type: String,
        enum: ["light", "dark"],
        default: "light",        
    }

},{timestamps:true});

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
