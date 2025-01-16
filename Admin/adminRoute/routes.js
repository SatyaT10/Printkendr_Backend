const adminRoute = require("express").Router()
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const auth = require('../../Middleware/auth');
const { newAdmin, adminLogin, createProduct, getAllProduct, getSingleProduct, updateProduct, deleteProduct, updatePassword, forgetPassword, resetPassword, newCategory, getAllCategory, deleteCategory, updateCategory, getCatDaitles, getCatWiseProduct, getTotalCount, fillQuantityPrice } = require('../adminControllers/controllers');
const { getAllOrder, updateOrderStatus, getAllOrderInExcel } = require("../../ManageOrder/orderContollers/controllers");
const { getUserApprovel, getAllUsers, getApprovedUsers, getUnapprovedUser, getUserDaitles, newUser, updateBalance, updateUserProfile } = require("../../User/userControllers/controllers");


const Storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "../../Images")
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        if (!file) return
        const name = `${Date.now()}-byAdmin-${file.originalname}`;
        cb(null, name);
    }
});



const Upload = multer({ storage: Storage });


adminRoute.post('/register', newAdmin)

adminRoute.post('/login', adminLogin)

adminRoute.post('/forget-password', forgetPassword);

adminRoute.post('/reset-password', resetPassword);

adminRoute.post('/chnage-password', auth.verifyToken, updatePassword);

adminRoute.post('/add-category', auth.verifyToken, Upload.single('image'), newCategory);

adminRoute.get('/all-category', auth.verifyToken, getAllCategory)

adminRoute.post('/delete-category', auth.verifyToken, deleteCategory);

adminRoute.post('/update-category', auth.verifyToken, updateCategory);

adminRoute.get('/get-cat-daitles', auth.verifyToken, getCatDaitles);

adminRoute.get('/cat-wise-prod', auth.verifyToken, getCatWiseProduct);

adminRoute.post('/create-product', auth.verifyToken, Upload.single('image'), createProduct)

adminRoute.post('/add-prices', auth.verifyToken, fillQuantityPrice);

adminRoute.get('/get-all-product', auth.verifyToken, getAllProduct)

adminRoute.get('/get-product', auth.verifyToken, getSingleProduct)

adminRoute.post('/update-product', auth.verifyToken, updateProduct)

adminRoute.post('/delete-product', auth.verifyToken, deleteProduct)

adminRoute.get('/get-all-order', auth.verifyToken, getAllOrder);

adminRoute.get('/get-order-excel', auth.verifyToken, getAllOrderInExcel);

adminRoute.post('/update-status', auth.verifyToken, updateOrderStatus);

adminRoute.get('/get-approvel', auth.verifyToken, getUserApprovel);

adminRoute.get('/get-users', auth.verifyToken, getAllUsers);

adminRoute.post('/get-user-daitles', auth.verifyToken, getUserDaitles);

adminRoute.post('/add-new-user', auth.verifyToken, newUser);

adminRoute.get('/get-approved-user', auth.verifyToken, getApprovedUsers);

adminRoute.get('/pending-users', auth.verifyToken, getUnapprovedUser);

adminRoute.get('/get-users-count', auth.verifyToken, getTotalCount);

adminRoute.post('/update-wallet-balence', auth.verifyToken, updateBalance);

adminRoute.post('/update-user-daitles', auth.verifyToken, updateUserProfile);

module.exports = adminRoute