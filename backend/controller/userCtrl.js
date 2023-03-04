const User = require('../models/userModel');

const Product = require("../models/productModel");
const asyncHandler=require("express-async-handler");
const { generateToken } = require('../config/jwtToken');
const validateMongodbId = require('../utils/validateMongodbid');
const Cart = require("../models/cartModel");
const jwt = require("jsonwebtoken");
const { generateRefreshToken } = require("../config/refreshtoken");
const createUser= asyncHandler( async (req, res) => {
    const email = req.body.email;
    const findUser= await User.findOne({email:email});
    if(!findUser){
    // create a new user
     const newUser =await User.create(req.body);
     res.json(newUser);
    }
    else {
    
  throw new Error("User Aready Exists");
    }
    
    
    });


    const loginUseCtrl= asyncHandler(async(req,res)=>{
const {email, password}=req.body;
// check if user exists or not
const findUser= await User.findOne({email});
if(findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateuser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
    })
res.json({
    _id: findUser?._id,
    firstname: findUser?.firstname,
    lastname: findUser?.lastname,
    email:findUser?.email,
    mobile:findUser?.mobile,
    token: generateToken(findUser?._id)
});
}else{
    throw new Error("invalid Credentials")
}

    });
    // handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) throw new Error(" No Refresh token present in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err || user.id !== decoded.id) {
        throw new Error("There is something wrong with refresh token");
      }
      const accessToken = generateToken(user?._id);
      res.json({ accessToken });
    });
  });
  // logout functionality

const logout = asyncHandler(async (req, res) => {
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
    await User.findOneAndUpdate(refreshToken, {
      refreshToken: "",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    res.sendStatus(204); // forbidden
  });
    //update a user

    const updateUser= asyncHandler(async (req, res)=>{
    console.log();
     const {_id} = req.user;
     validateMongodbId(_id);
     try{

const updateUser= await User.findByIdAndUpdate(_id, 
    {
 firstname:req?.body.firstname,
 lastname:req?.body.lastname,
 email:req?.body.email,
mobile:req?.body.mobile,

},
{
new: true,

}
);
res.json(updateUser)

     }  catch(error){
        throw new Error(error)

     }
    })

    //get all users
    const getallUser =asyncHandler(async (req, res)=> {
        try{
            const getUsers= await User.find()
            res.json(getUsers);

        }catch(error){
            throw new Error(error)
        }
    })

    // get a single user
    const getaUser= asyncHandler(async (req, res)=>{
       
const {id}= req.params;

validateMongodbId(id);
try{
const getaUser =await User.findById(id);
res.json({
    getaUser,
})

}catch(error){
    throw new Error(error) ;
}

    });

     // delete a single user
     const deleteaUser= asyncHandler(async (req, res)=>{
       
        const {id}= req.params;
        validateMongodbId(id);
        try{
        const deleteaUser =await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })
        
        }catch(error){
            throw new Error(error) ;
        }
        
            });
        
const blockUser = asyncHandler(async (req, res)=>{
     const {id} = req.params;
     validateMongodbId(id);
     try {
    const block =await User.findByIdAndUpdate(
        id,
        {
             isBlocked : true,
            
        },
        {
            new: true,
        }
    );
    res.json({
        message: "user Blocked",
    })
     } catch (error){
        throw new Error( error)
     }
});
const unblockUser = asyncHandler(async (req, res)=>{

    const {id} = req.params;
    validateMongodbId(id);
    try {
   const unblock = await User.findByIdAndUpdate(
       id,
       {
            isBlocked : false,
           
       },
       {
           new: true,
       }
   );
   res.json({
    message: "user UnBlocked",
})
  
    } catch (error){
       throw new Error( error)
    }



});
const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
      let products = [];
      const user = await User.findById(_id);
      // check if user already have product in cart
      const alreadyExistCart = await Cart.findOne({ orderby: user._id });
      if (alreadyExistCart) {
        alreadyExistCart.remove();
      }
      for (let i = 0; i < cart.length; i++) {
        let object = {};
        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        let getPrice = await Product.findById(cart[i]._id).select("price").exec();
        object.price = getPrice.price;
        products.push(object);
      }
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
      }
      let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user?._id,
      }).save();
      res.json(newCart);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongodbId(_id);
    try {
      const cart = await Cart.findOne({ orderby: _id }).populate(
        "products.product"
      );
      res.json(cart);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      const user = await User.findOne({ _id });
      const cart = await Cart.findOneAndRemove({ orderby: user._id });
      res.json(cart);
    } catch (error) {
      throw new Error(error);
    }
  });
  

module.exports = {createUser, loginUseCtrl, getallUser, getaUser, deleteaUser, updateUser, blockUser,
     unblockUser,handleRefreshToken,logout,userCart,getUserCart,emptyCart};