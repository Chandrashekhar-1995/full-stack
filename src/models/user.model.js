import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    role:{
        type:String,
        enum:["user", "admin"],
        default:"user",
    },
    verificationToken:{
        type:String
    },
    verificationTokenExpiry:{
        type:Date,
    },
    resetPasswordToken:{
        type:String
    },
    resetPasswordTokenExpiry:{
        type:Date,
    },
    refreshToken:{
        type:String
    },
}, {timestamps:true});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  

userSchema.methods.isPasswordCorrect = async function (password) {
return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({id: this._id},
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY},
    );
  };

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
      {
        id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
    );
  };

const User = mongoose.model("User", userSchema);
export default User;