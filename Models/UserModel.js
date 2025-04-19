const mongoose = require("mongoose");
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
      trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  isVerified:{
    type:Boolean,
    default:false
  },
  otp:{
    type:String
    },

    otpExpires:{
        type:Date
    },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
}


  UserSchema.methods.generateAuthToken = async function (){
      const token= jwt.sign({_Id:this._id},process.env.SECRET_KEY,{ expiresIn: "7d" });

      return token;
  }

UserSchema.pre('save',  async function(next){

    if(!this.isModified('password')){
        return next();
    }
    try {
        const salt= await  bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
        
    } catch (error) {
        next(error)
        
    }

    
})

module.exports=mongoose.model('user',UserSchema);