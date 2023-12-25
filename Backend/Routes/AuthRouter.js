const express = require('express');

const router = express.Router();

const { registerUser, loginUser, getAllUsers, getUserById, deleteUserById, updateUserById, blockUser, unblockUser, handleRefreshToken, logoutUser } = require('../Controllers/UserController');

const { authMiddleware, isAdmin } = require('../Middlewares/AuthMiddleware');


router.post("/register", registerUser);

router.post("/login", loginUser)

router.get('/refresh', handleRefreshToken)

router.get('/logout', logoutUser)

router.get('/all-users', getAllUsers)

router.get('/get-user/:id', authMiddleware, getUserById)

router.delete('/delete-user/:id', deleteUserById)

router.put('/edit-user/:id', authMiddleware, updateUserById)

router.put('/block-user/:id', authMiddleware, isAdmin, blockUser)

router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser)


module.exports = router;
