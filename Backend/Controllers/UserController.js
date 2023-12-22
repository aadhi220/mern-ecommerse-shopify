const User = require("../Models/UserSchema");

const checkExistingEmail = async (email) => {
  console.log("inside check existing email user");
  const user = await User.findOne({ email });
  return user !== null;
};

exports.registerUser = async (req, res) => {
  console.log("inside register user");
  const { firstname, lastname, email, password, mobile } = req.body;
  const emailExists = await checkExistingEmail(email);
  if (emailExists) {
    return res
      .status(406)
      .json({ message: "Email already exists", success: false });
  }

  try {
    const newUser = new User({
      firstname: firstname,
      lastname: lastname,
      email: email,
      mobile: mobile,
      password: password,
    });

    await newUser.save();
    // res.status(200).json({message:"Registeration Successfull",data:newUser})
    return res
      .status(200)
      .json({
        message: "User registered successfully",
        success: true,
        data: newUser,
      });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

exports.loginUser = async (req, res) => {
  console.log("inside login user");
  const { email, password } = req.body;

  try {
    const findUser = await User.findOne({ email: email, password: password });
    return res
      .status(200)
      .json({
        message: `Welcome Back ${findUser.firstname} `,
        data: findUser,
        success: true,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: "invalid credentials" });
  }
};
