const mongoose=require('mongoose')

const ContactForm= mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    message:{type:String,required:true},
    subject:{type:String,require:true},
})

module.exports=mongoose.model('contact',ContactForm);