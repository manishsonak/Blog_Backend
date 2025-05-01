const ContactModel = require("../Models/ContactModel");
const UserModel = require("../Models/UserModel");
const transporter = require("../Utility/SendMail");
const crypto = require("crypto");
const { validationResult } = require('express-validator');

module.exports.RegisterUser = registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    if (!firstName || !email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    const error= validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
      }

    const isUser = await UserModel.findOne({ email });
    if (isUser) {
      return res
        .status(400)
        .json({ message: "Email already exists with this email" });
    }
    const otp = crypto.randomInt(100000, 1000000);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    const User = await UserModel.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      otp,
      otpExpires,
    });
    
    
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Verification Code",
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions,(err,info)=>{
      if(err){
        console.log(err);
        }
        else{
          console.log(info.response);
          }
    });
   

    if (!User) {
      return res.status(400).json({ msg: "User not created" });
    }

    res.status(200).json({
      message: "OTP sent on Mail ",
      // user: User,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports.VerifyOtp = verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const User = await UserModel.findOne({ email: email });
    if (!User) {
      return res.status(400).json({ msg: "User not found" });
    }

    
    
    if (User.otp !== otp || User.otpExpires <= Date.now()) {
      return res.status(400).json({ msg: "Invalid or Expired OTP" });
    }
    User.otp = null;
    User.otpExpires = null;
    User.isVerified = true;
    await User.save();

    const token= await User.generateAuthToken();

    res
    .cookie('token', token,
       {
      httpOnly: true,
      secure: true,        
      sameSite: 'None',    
    }
  )
    .set('Authorization', `Bearer ${token}`)



    res.status(200).json({
      message: "User verified successfully",
      user: User,

    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports.GetUser= getUser = async (req,res)=>{
  try {
    const id=req.Id
    const User = await UserModel.findById(id).select(["-password",'-otp','-otpExpires','-isVerified']);   
    if (!User) {
      return res.status(400).json({ msg: "User not found" });
      
    }
    res.status(200).json({ User });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal Server Error",
        });
        }
}

module.exports.loginUser=loginUser= async (req,res)=>{

  try {

    const {email,password}= req.body;

    const error= validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }


    const user= await UserModel.findOne({email});

    

    if(!user){
      return res.status(400).json({msg:"Invalid email or password"})
    }

    const isMatch= await user.comparePassword(password);
    if(!isMatch){
      return res.status(400).json({msg:"Invalid email or password"})
      }
      const token = await user.generateAuthToken();

      res
      .cookie('token', token, 
        {
        httpOnly: true,
        secure: true,        
        sameSite: 'None',    
      }
    )
      .set('Authorization', `Bearer ${token}`)

      res.status(200).json({
        message: "User logged in successfully",
        token:token,
        user:user
      })
    
    
  } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal Server Error",
        });
      
  }

}

module.exports.logOut=logOut = async (req,res)=>{

  try {

    const id=req.Id;
    const user = await UserModel.findById(id);
    if(!user){
      return res.status(400).json({msg:"Invalid user"})
    }
    res.clearCookie('token', {
  httpOnly: true,
  secure: true,
  sameSite: 'None',
});
    res.status(200).json({ message: "Logged out successfully" });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      });
  }

}

module.exports.forgotPassword= forgotPassword = async (req,res)=>{

    try {

      const {email}=req.body
    

      const error= validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }

      const user= await UserModel.findOne({email});
      
      if(!user){
        return res.status(400).json({msg:"Invalid user"})
        }
        const otp=crypto.randomInt(100000,1000000);
        const otpExpires= new Date(Date.now() + 10 * 60 * 1000);

        const mailOptions={
          from: process.env.SMTP_MAIL,
          to: email,
          subject: 'Reset Password',
          text: `Your OTP is ${otp} and it will expire in 10 minutes`,
        };

          user.otp=otp,
          user.otpExpires=otpExpires,
          await user.save();

        transporter.sendMail(mailOptions,(err,info)=>{
          if(err){
            console.log(err);
            return res.status(500).json({message:"Failed to send OTP"})
            }else{
              console.log(info.response);
              
            }
           
        })

        res.status(200).json({
          message: "OTP sent to your email",
        })
      
      
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal Server Error",
        });
      
    }

}
module.exports.chnangePassword=changePassword= async (req,res)=>{

  try {

    const {oldPassword, newPassword}= req.body;
    const {id} = req.params;
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
      }
    
      

      const isMatch= await user.comparePassword(oldPassword);
    
      if(!isMatch){
        return res.status(400).json({message:"Old password is incorrect"})
      }

      user.password=newPassword;
      await user.save();

      res.status(200).json({
        message: "Password changed successfully",

      })


   
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      });
    
  }

}

module.exports.resetPassword=resetPassword = async (req,res)=>{

  try {

    const {email,newPassword}= req.body;

    const user= await UserModel.findOne({email});

    if(!user){
      return res.status(404).json({message:"User not found"})
    }

    user.password=newPassword;
    await user.save();

    res.status(200).json({
      message: "Password Reset successfully",

    })

    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    })
    
  }

}

module.exports.allUser= allUser = async (req,res)=>{

  try {
     
    const users = await UserModel.find().select(["-password",'-otp','-otpExpires','-isVerified']);
    if(!users){
      return res.status(404).json({message:"No users found"})
    }
    res.status(200).json({
      users 
      })
    
  } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal Server Error",
      })
      
  }

}

module.exports.updateProfile= updateProfile = async (req,res)=>{

  try {


    const { firstName = null, lastName = null, phone = null } = req.body || {};

    const {id}=req.params;

    const user= await UserModel.findById(id).select(['-password','-otp','-otpExpires','-isVerified']);

    if(!user){
      res.status(400).json({
        message: "User not found",
      })
    }
   user.firstName=firstName || user.firstName;
    user.lastName= lastName || user.lastName;
    user.phone=phone || user.phone;
      
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user
    })


    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    })
    
  }

}

module.exports.deleteUser= deleteUser = async (req,res)=>{


  try {

    const {id}=req.params;

    const user= await UserModel.findByIdAndDelete({
      _id:id
    })
    if (!user) {
      res.status(400).json({
        message: "User not found",
        })
    }

    res.status(200).json({
      message: "User deleted successfully",
      user

    })
   

    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      })
    
  }

}

module.exports.resendOtp= resendOtp = async (req,res)=>{

  try {
    const {email}=req.body;
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      res.status(400).json({
        message: "User not found",
        })
        }
        const otp = crypto.randomInt(100000,1000000);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

        user.otp=otp;
        user.otpExpires=otpExpiry;
        await user.save();

        const mailOptions={
          from: process.env.SMTP_MAIL,
          to: email,
          subject: 'OTP for login',
          text: `Your OTP is ${otp} and it will expire in 10 minutes`,
        }

        transporter.sendMail(mailOptions,(err,info)=>{
          if(err){
            console.log(err);
          return  res.status(500).json({
              message: "Something Error Otp not sent ",
              })
              }else{
                console.log(info.response);
                
              }
        })
        
        res.status(200).json({
          message: "OTP sent successfully",
          // otp
          })
    
  } catch (error) {
    console.log(error);;
    res.status(500).json({
      message: "Internal Server Error",
      })
    
  }

}

module.exports.sendFeedback= sendFeedback = async (req,res)=>{
  try {

    const error= validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
      }

    const {name,email,message,subject}= req.body;

    const findData= await ContactModel.findOne({email});
    if(findData){
      return res.status(400).json({
        message: "You have already sent feedback",
        })
        };

    const newForm= await ContactModel.create({
      name,
      email,
      message,
      subject
    });

    if(!newForm){
      return res.status(400).json({
        message: "Something went wrong while sending feedback",
        })
    };
    res.status(200).json({
      message: "Feedback sent successfully",
      })

    
    
  } catch (error) {
    console.log(error);;
    res.status(500).json({
      message: "Internal Server Error",
      })
    
  }
}

module.exports.getAllFeedbacks= getAllFeedbacks = async (req,res)=>{

  try {

    const {page,limit}= req.query;
    const pageNo= parseInt(page);
    const limitNo= parseInt(limit);
    const skip= (pageNo-1)*limitNo;
    const feedbacks= await ContactModel.find().skip(skip).limit(limitNo).sort({createdAt:-
      1}).select('-_id');
      const totalFeedbacks= await ContactModel.countDocuments();
      const totalPages= Math.ceil(totalFeedbacks/limit);
      res.status(200).json({
        feedbacks,
        totalPages,
        totalFeedbacks
        })
  
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      })
    
  }

}
