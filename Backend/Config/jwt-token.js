const jwt = require("jsonwebtoken");

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
};



const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });


}




module.exports = { generateRefreshToken, generateToken };

