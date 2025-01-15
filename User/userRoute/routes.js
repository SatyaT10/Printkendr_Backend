const route = require('express').Router()
const auth = require('../../Middleware/auth');
const multer = require('multer');
const path = require('path');
const Order = require('../../Model/OrdarModel');
const fs = require('fs')

const { getAllProduct, getSingleProduct, getCatWiseProduct, getAllCategory } = require('../../Admin/adminControllers/controllers');
const { orderPlace, getMyOrder, getMyOrderDaitle, orderCancel, verifyAndUpdateWallet, createOrderToAddBalance } = require('../../ManageOrder/orderContollers/controllers');
const { newUser, userLogin, changePassword, forgetPassword, resetPassword, sendResetPasswordMail, getWalletBalance, updateUserProfile } = require('../userControllers/controllers');



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define the directory where files will be stored
        const dir = path.join(__dirname, '../../orderFile');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir); // Save
    },
    filename: async (req, file, cb) => {
        const lastOrder = await Order.findOne({}, {}, { sort: { order_id: -1 } });
        const newOrderId = lastOrder ? lastOrder.order_id + 1 : 1;
        const name = `OrderNo.-${newOrderId}`;
        cb(null, name + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
});


route.get('/', async (req, res) => {
    const { email, otp } = req.body
    await sendResetPasswordMail(
        "Satya", email, otp
    )
    res.status(200).json({
        success: true,
        message: "User Route Working..."
    })
})

route.post('/register', newUser);

route.post('/login', userLogin);

route.post('/forget-password', forgetPassword);

route.post('/reset-password', resetPassword)

route.post('/update-profile', auth.verifyToken, updateUserProfile);

route.post('/chnage-password', auth.verifyToken, changePassword);

route.get('/get-all-category', auth.verifyToken, getAllCategory);

route.get('/get-all-product', auth.verifyToken, getAllProduct)

route.post('/order-place', auth.verifyToken, upload.single('orderFile'), orderPlace);

route.get('/get-order', auth.verifyToken, getMyOrder);

route.get('/get-order-daitle', auth.verifyToken, getMyOrderDaitle);

route.get('/get-product', auth.verifyToken, getSingleProduct);

route.get('/get-cat-wise-product', auth.verifyToken, getCatWiseProduct);

route.get('/wallet-balance', auth.verifyToken, getWalletBalance);

route.post('/cancel-order', auth.verifyToken, orderCancel);

route.post('/add-balance', auth.verifyToken, createOrderToAddBalance);

route.post('/verify-payment', auth.verifyToken, verifyAndUpdateWallet)

module.exports = route