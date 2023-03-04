const express = require ('express');

const { createUser, loginUseCtrl, getallUser, getaUser, deleteaUser, updateUser, blockUser, unblockUser, handelRefreshToken, handleRefreshToken, logout, userCart, getUserCart, emptyCart } = require('../controller/userCtrl');

const {authMiddleware,isAdmin }= require("../middelweares/authMiddelweares");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUseCtrl);
router.post("/cart", authMiddleware, userCart);
router.get("/cart", authMiddleware,getUserCart);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.get('/all-users',getallUser);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get('/:id', authMiddleware,isAdmin, getaUser);
router.delete('/:id', deleteaUser);
router.put('/edit-user',authMiddleware, updateUser); 
router.put("/block-user/:id", authMiddleware , isAdmin , blockUser  );
router.put('/unblock-user/:id',authMiddleware, isAdmin, unblockUser );


module.exports = router;
