const mongoose=require('mongoose');

 async function connection(){
    
    try {
         await mongoose.connect(`${process.env.MONGO_URL}/MyBlog`);
         console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);

    }

}

module.exports=connection;