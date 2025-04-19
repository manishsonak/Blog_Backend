const express=require('express');
require('dotenv').config();
const cors=require('cors')
const app=express();
const cookieParser=require('cookie-parser')
const userRoute=require('./Routers/UserRoute');
const postsRoute=require('./Routers/PostRoutes');
const connection=require('./Connection/DBConnection');

app.use(cookieParser())

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:process.env.CORE_URL,
    methods:['POST','PUT','DELETE','GET'],
    credentials:true
}))

app.get('/',(req,res)=>{
    res.send('Hello World')
})
app.use('/api/users', userRoute);
app.use('/api/posts', postsRoute);


connection();

app.listen(process.env.PORT,()=>{
    console.log('server is running on port ', process.env.PORT);
})