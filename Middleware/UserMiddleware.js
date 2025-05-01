const jwt = require("jsonwebtoken");

const UserAuth = (req, res, next) => {
  try {
      

    const token =
      req.cookies.token || req.header("Authorization")?.split(" ")[1];

      
      
    if (!token) {
 
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    


    
    
    const id = jwt.verify(token, process.env.SECRET_KEY);
   
    

    if (!id) {
      return res.status(400).json({ message: "Invalid token" });
    }

    req.Id = id._Id;

    
    next();

  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "You must login" });
  }
};

module.exports = UserAuth;
