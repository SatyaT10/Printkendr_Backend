require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const Product = require('../../Model/productModel');
const Admin = require('../../Model/adminModel');
const User = require('../../Model/UserModal');
const Category = require('../../Model/CategoryModel');
const CustomError = require('../../error/CustomError');
const Ordar = require('../../Model/OrdarModel');
const Wallet = require('../../Model/WalletModel');
const Combination = require('../../Model/CombinationModel');

const { sendResetPasswordMail, generateOtp, securePassword, verifyOtp } = require('../../User/userControllers/controllers');

const newAdmin = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const { name, email, password, mobile } = reqBody;
        if (!email || !password || !name || !mobile) {
            throw new CustomError("Please fill all the required fields", 400);
        }
        const userData = await Admin.findOne({ email: email });
        const newPassword = await securePassword(password);
        if (userData) {
            throw new CustomError("User Already Exist", 400);
        } else {
            await Admin.create({
                name: name,
                email: email,
                password: newPassword,
                mobile: mobile,
            });

            res.status(201).json({ success: true, msg: "Registation Completed Successfully!" });
        }
    } catch (error) {
        console.error("Error when admin wants to register himself:", error.message);
        next(error)
    }
}



const adminLogin = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;
        if (!email || !password) {
            throw new CustomError("Please fill all the required fields", 400);
        }
        const userData = await Admin.findOne({ email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                const user = {
                    id: userData._id,
                    email: userData.email,
                    name: userData.name,
                    isAdmin: userData.is_admin,
                    phone: userData.mobile
                }
                const token = await jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIREIN });
                const response = {
                    success: true,
                    message: "User LogedIn",
                    token: token,
                    userData: user
                }
                res.status(200).json(response);
            } else {
                throw new CustomError("Email Or Password Wrong!", 400);
            }
        } else {
            throw new CustomError("Email Or Password Wrong!", 400);
        }
    } catch (error) {
        console.error("Error when admin wants to try login :", error.message);
        next(error)
    }
}

const createProduct = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin
        const filename = req.file.filename;
        let productImage = `${process.env.IMGURL}Images/${filename}`;
        const categoryId = req.body._id;
        if (isAdmin == 1) {
            if (categoryId) {
                const isCategory = await Category.findOne({
                    _id: categoryId
                })
                if (isCategory) {
                    const ProductCreated = await Product.create({
                        productName: req.body.productName,
                        description: req.body.description,
                        size: req.body.size,
                        paperType: req.body.paper,
                        printingType: req.body.printing,
                        finishingType: req.body.finishing,
                        quantity: req.body.quantity,
                        productImage: productImage,
                        categoryId: categoryId,
                    });
                    const { size, paperType, printingType, finishingType, quantity } = ProductCreated;

                    const sizes = size.length ? size : [''];
                    const paperTypes = paperType.length ? paperType : [''];
                    const printingTypes = printingType.length ? printingType : [''];
                    const finishingTypes = finishingType.length ? finishingType : [''];
                    const combinations = [];
                    sizes.forEach(s => {
                        paperTypes.forEach(p => {
                            printingTypes.forEach(pt => {
                                finishingTypes.forEach(f => {
                                    combinations.push({
                                        productId: ProductCreated._id,
                                        attributes: {
                                            size: s,
                                            paperType: p,
                                            printingType: pt,
                                            finishingType: f
                                        },
                                        quantityWithPrice: quantity.map(q => {
                                            return {
                                                quantity: q,
                                            }
                                        })
                                    });
                                });
                            });
                        });
                    });
                    const savedCombinations = await Combination.insertMany(combinations);
                    console.log(`${savedCombinations.length} combinations created.`);
                    console.log('Quantity added successfully.');
                    res.status(201).json({
                        success: true,
                        message: "Product Created sucessfully!",
                        Combinations: savedCombinations
                    })
                } else {
                    throw new CustomError("Category Not Found!", 404);
                }
            } else {
                throw new CustomError("Category Id is required!", 400);
            }
        } else {
            throw new CustomError("You are not Authorized!", 401);
        }
    } catch (error) {
        console.error("Error creating products:", error.message);
        next(error)
    }
}

const fillQuantityPrice = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin
        const combinationId = req.body._id;
        const quantityPrice = req.body.quantityPrice;
        if (isAdmin == 1) {
            const combination = await Combination.findOne({ _id: combinationId });
            if (combination) {
                if (!(combination.quantityWithPrice.length == quantityPrice.length)) {
                    throw new CustomError("Quantity and Price should be equal", 400);
                } else {
                    console.log(combination.quantityWithPrice[0].quantity);
                    const quantityWithPrice = quantityPrice.map((q, index) => ({
                        quantity: combination.quantityWithPrice[index].quantity,
                        price: q,

                    }));
                    const updatePrice = await Combination.findOneAndUpdate(
                        { _id: combinationId },
                        { $set: { quantityWithPrice } },
                        { new: true } // This option returns the updated document
                    );
                    console.log('Updated Combination:', updatePrice);
                    res.status(201).json({
                        success: true,
                        message: "Quantity and Price added successfully",
                        quantityPrice: updatePrice
                    });
                }
            } else {
                throw new CustomError("Combination not found", 404);
            }
        } else {
            throw new CustomError("You are not Authorized!", 401);
        }
    } catch (error) {
        console.error("Error filling quantity price:", error.message);
        next(error)
    }
}

const getAllProduct = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin
        const isUser = req.user.id
        if (isAdmin == 1 || isUser) {
            const allProduct = await Product.find().populate('createdAt').sort({
                createdAt: -1
            });
            return res.status(200).json({
                success: true,
                message: "Products retrieved successfully",
                allProduct: allProduct,
            });
        } else {
            throw new CustomError("You are not Authorized!", 401);
        }
    } catch (error) {
        console.error("Error retrieving products:", error.message);
        next(error)
    }
};


const getSingleProduct = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin
        const ProductId = req.body._id
        const isUser = req.user.id
        if (isAdmin == 1 || isUser) {
            const ProductData = await Product.findOne({
                _id: ProductId
            })
            const productCombination = await Combination.find({ productId: ProductId })
            if (ProductData) {
                res.status(200).
                    json({
                        success: true,
                        message: "Your Product Daitles....",
                        Product: ProductData,
                        productCombination: productCombination
                    })
            } else {
                throw new CustomError("Product isn't available", 404);
            }
        } else {
            throw new CustomError("Your are not able to change any options!", 401);
        }

    } catch (error) {
        console.error("Error retrieving products:", error.message);
        next(error)
    }
}


const updateProduct = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin
        const ProductId = req.body._id
        if (isAdmin == 1) {
            const ProductData = await Product.findOneAndUpdate({
                _id: ProductId
            }, {
                $set: req.body
            })
            if (ProductData) {
                res.status(201).
                    json({
                        success: true,
                        message: "Your Product Daitles....",
                        Product: ProductData
                    })
            } else {
                throw new CustomError("Product isn't available", 404);
            }
        } else {
            throw new CustomError("Your are not able to change any options!", 401);
        }
    } catch (error) {
        console.error("Error updating products:", error.message);
        next(error)
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin
        const ProductId = req.body._id
        if (isAdmin == 1) {
            const ProductData = await Product.findOneAndDelete({
                _id: ProductId
            })
            if (ProductData) {
                res.status(201).
                    json({
                        success: true,
                        message: "Your Product Daitles....",
                        Product: ProductData
                    })
            } else {
                throw new CustomError("Product isn't available", 404);
            }
        } else {
            throw new CustomError("Your are not able to delete any options!", 401);
        }
    } catch (error) {
        console.error("Error deleting products:", error.message);
        next(error)
    }
}

const updatePassword = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin
        const { oldPassword, newPassword } = req.body;
        if (isAdmin == 1) {
            const userData = await Admin.findOne({ email: req.user.email });
            const isPasswordMatch = await bcrypt.compare(oldPassword, userData.password);
            if (isPasswordMatch) {
                const hashedPassword = await securePassword(newPassword);
                const updatedData = await Admin.findOneAndUpdate({ email: req.user.email }, {
                    $set:
                    {
                        password: hashedPassword
                    }
                });
                res.status(201).json({
                    success: true,
                    message: "Password updated successfully",
                    updatedData
                });
            } else {
                throw new CustomError("Old password is incorrect", 401);
            }
        } else {
            throw new CustomError("You are not able to update password!", 401);
        }
    } catch (error) {
        console.error("Error updating password:", error.message);
        next(error)
    }
}

const forgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new CustomError("Email is required", 400);
        } else {
            const userDaitle = await Admin.findOne({
                email: email
            })
            if (userDaitle) {
                const otp = generateOtp(email);
                console.log(otp);

                await sendResetPasswordMail(userDaitle.name, userDaitle.email, otp);
                res.status(201).json({
                    success: true,
                    message: "Please check your mail for otp to reset your password!",
                });
            } else {
                throw new CustomError("User not found", 404);
            }
        }
    } catch (error) {
        console.error("Error forget password:", error.message);
        next(error)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword, otp } = req.body;
        if (!email || !newPassword || !otp) {
            throw new CustomError("Email, newPassword and otp are required", 400);
        }
        else {
            const userDetail = await Admin.findOne({ email: email })
            if (userDetail) {
                const isOtpValid = verifyOtp(userDetail.email, otp);
                if (isOtpValid.success == true) {
                    const hashedPassword = await securePassword(newPassword);
                    await Admin.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } });
                    res.status(200).json({
                        success: true,
                        message: "Password reset successfully"
                    })
                }
                else {
                    throw new CustomError(`${isOtpValid.message}`, 400);
                }
            }
            else {
                throw new CustomError("User not found", 404);
            }
        }
    } catch (error) {
        console.error("Error reset password:", error.message);
        next(error);
    }
}

const newCategory = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        const { categoryName, categoryDescription } = req.body;
        const filename = req.file.filename
        let cateImage = `${process.env.IMGURL}Images/${filename}`;
        if (isAdmin == 1) {
            if (categoryName) {
                await Category.create({
                    categoryName,
                    categoryDescription,
                    categoryImage: cateImage
                });
                res.status(201).json({
                    success: true,
                    message: "Category added successfully...."
                })
            } else {
                throw new CustomError("Category name is required", 400);
            }
        } else {
            throw new CustomError("You are not authorized to perform this action", 401);
        }
    } catch (error) {
        console.log("Error creating product category:", error.message);
        next(error)
    }
}

const getAllCategory = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        const userId = req.user.id;
        if (isAdmin == 1 || userId) {
            const categories = await Category.findAll();
            if (categories) {
                res.status(200).json({
                    success: true,
                    categories
                })
            } else {
                throw new CustomError("No categories found", 404);
            }
        } else {
            throw new CustomError("You are not authorized to perform this action", 401);
        }
    } catch (error) {
        console.error("Error retrieving product category:", error.message);
        next(error)
    }
}
const deleteCategory = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        const categoryId = req.body._id;
        if (isAdmin == 1) {
            if (categoryId) {
                const category = await Category.findOne({
                    _id: categoryId
                });
                if (category) {
                    await Product.deleteMany({
                        categoryId: categoryId
                    });
                    await Category.findOneAndDelete({
                        _id: categoryId
                    })
                    res.status(200).json({
                        success: true,
                        message: "Category deleted successfully"
                    })
                } else {
                    throw new CustomError("Category not found", 404);
                }
            } else {
                throw new CustomError("Category id is required", 400);
            }
        } else {
            throw new CustomError("You are not authorized to perform this action", 401);
        }
    } catch (error) {
        console.error("Error deleting product category:", error.message);
        next(error)
    }
}

const updateCategory = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        const categoryId = req.body._id;
        if (isAdmin == 1) {
            if (categoryId) {
                await Category.findOneAndUpdate({
                    _id: categoryId
                }, req.body);
                res.status(200).json({
                    success: true,
                    message: "Category updated succesfully!"
                })
            } else {
                throw new CustomError("Category id and data are required", 400);
            }
        } else {
            throw new CustomError("You are not authorized to perform this action", 401);
        }
    } catch (error) {
        console.error("Error update product category:", error.message);
        next(error)
    }
}


const getCatDaitles = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        const categoryId = req.body._id
        if (isAdmin == 1) {
            if (categoryId) {
                const category = await Category.findById({
                    _id: categoryId
                });
                if (category) {
                    res.status(200).json({
                        success: true,
                        data: category
                    });
                } else {
                    throw new CustomError("Category not found", 404);
                }
            } else {
                throw new CustomError("Category id is required", 400);
            }
        } else {
            throw new CustomError("You are not authorized to perform this action", 401);
        }

    } catch (error) {
        console.error("Error retrieving product category dailtes:", error.message);
        next(error)
    }
}


const getCatWiseProduct = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        const categoryId = req.body._id
        const isUser = req.body.id
        if (isAdmin == 1 || isUser) {
            if (categoryId) {
                const category = await Category.findById({
                    _id: categoryId
                });
                if (category) {
                    const products = await Product.find({
                        categoryId: categoryId
                    });
                    if (products) {
                        res.status(200).json({
                            success: true,
                            data: products
                        });
                    } else {
                        throw new CustomError("No products found in this category", 404);
                    }
                } else {
                    throw new CustomError("Category not found", 404);
                }
            } else {
                throw new CustomError("Category id is required", 400);
            }
        } else {
            throw new CustomError("You are not authorized to perform this action", 401);
        }
    } catch (error) {
        console.error("Error retrieving product category wise:", error.message);
        next(error)
    }
}

const getTotalCount = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        if (isAdmin == 1) {
            const totalUser = await User.countDocuments();
            const totalActiveUser = await User.countDocuments({ is_approved: 1 });
            const newRequest = totalUser - totalActiveUser
            const totalOrder = await Ordar.countDocuments();
            const totalCompletedOrder = await Ordar.countDocuments({ status: "completed" });
            const totalProcessingOrder = await Ordar.countDocuments({ status: "processing" });
            const totalNewOrder = totalOrder - totalCompletedOrder - totalProcessingOrder;
            const totalProduct = await Product.countDocuments()
            const totalCategory = await Category.countDocuments();
            const totalWalletAmount = await Wallet.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$balance" }
                    }
                }
            ]);

            const totalBalance = totalWalletAmount.length > 0 ? totalWalletAmount[0].total : 0;

            console.log("Total Wallet Balance:", totalBalance);

            let count = {
                totalUser: totalUser,
                totalActiveUser: totalActiveUser,
                newRequest: newRequest,
                totalOrder: totalOrder,
                totalCompletedOrder: totalCompletedOrder,
                totalProcessingOrder: totalProcessingOrder,
                totalNewOrder: totalNewOrder,
                totalProduct: totalProduct,
                totalCategory: totalCategory,
                totalBalance: totalBalance
            }
            res.status(200).json({
                success: true,
                message: "Total Count Retrieved Successfully",
                totalCount: count
            });
        }
        else {
            throw new CustomError("You are not authorized to view total count", 401);
        }
    } catch (error) {
        console.error("Error total count :", error.message);
        next(error)
    }
}

module.exports = {
    newAdmin,
    adminLogin,
    createProduct,
    getAllProduct,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    updatePassword,
    forgetPassword,
    resetPassword,
    newCategory,
    getAllCategory,
    deleteCategory,
    updateCategory,
    getCatDaitles,
    getCatWiseProduct,
    getTotalCount,
    fillQuantityPrice
}