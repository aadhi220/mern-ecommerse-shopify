const { generateToken, generateRefreshToken } = require("../Config/jwt-token");
const User = require("../Models/UserSchema");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const validateMongoDbId = require("../Utils/validateMongoDb");

// Function to check if email already exists in the database
const checkExistingEmail = async (email) => {
  console.log("inside check existing email user");
  const user = await User.findOne({ email });
  return user !== null;
};

// Register a new user
exports.registerUser = asyncHandler(async (req, res) => {
  console.log("inside register user");
  const { firstname, lastname, email, password, mobile } = req.body;
  const emailExists = await checkExistingEmail(email);
  if (emailExists) {
    throw new Error("User Already Exist!");
  }
  const newUser = new User({
    firstname: firstname,
    lastname: lastname,
    email: email,
    mobile: mobile,
    password: password,
  });
  await newUser.save();
  return res.status(200).json({
    message: "User registered successfully",
    success: true,
    data: newUser,
  });
});

// Login a user
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email: email });
  if (findUser && await findUser.isPassMatched(password)) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
      message: `Welcome Back ${findUser.firstname}`,
      success: true,
      data: {
        id: findUser?._id,
        firstname: findUser?.firstname,
        lastname: findUser?.lastname,
        email: findUser?.email,
        mobile: findUser?.mobile,
        role: findUser?.isAdmin,
        token: generateToken(findUser?._id)
      },
    });
  } else {
    throw new Error("invalid Credentials!!");
  }
});

// Handle refresh token
exports.handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({
      success: true,
      message: "token refreshed successfully",
      data: accessToken
    });
  });
});

// Logout user
exports.logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate({ refreshToken: refreshToken }, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update user by ID
exports.updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, mobile, email } = req.body;
  try {
    const updateUser = await User.findByIdAndUpdate({ _id: id }, {
      firstname: firstname,
      lastname: lastname,
      email: email,
      // password:password,
      mobile: mobile,
    }, {
      new: true
    });
    if (!updateUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "user Updated Successfully",
      success: true,
      data: updateUser
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users
exports.getAllUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find();
    if (!allUsers) {
      return res.status(404).json({
        message: "Userlist empty",
        success: false,
      });
    }
    res.status(200).json({
      message: "fetched all users succesfully",
      success: true,
      data: allUsers,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a single user
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const getUser = await User.findById(id);
    if (!getUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "Fetched user details successfully",
      success: true,
      data: {
        id: getUser._id,
        firstname: getUser.firstname,
        lastname: getUser.lastname,
        email: getUser.email,
        mobile: getUser.mobile,
        role: getUser.isAdmin,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete a user
exports.deleteUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    if (!deleteUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    res.status(200).json({
      message: "user deleted successfully",
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Block a user
exports.blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const blockedUser = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    if (!blockedUser) {
      res.json({
        success: false,
        message: ("User not found"),
        data: blockedUser
      });
    }
    res.json({
      success: true,
      message: ("User Blocked Successfully"),
      data: blockedUser
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Unblock a user
exports.unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblocked = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    if (!unblocked) {
      res.json({
        success: false,
        message: ("User not found"),
        data: unblocked
      });
    }
    res.json({
      message: "User UnBlocked successfully",
      success: true,
      data: unblocked,
    });
  } catch (error) {
    throw new Error(error);
  }
});