const User = require('../../Model/UserModal');
const Wallet = require('../../Model/walletModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const CustomError = require('../../error/CustomError');
require('dotenv').config();
const activeOtps = new Map();

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}



function generateOtp(email) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 15 * 60 * 1000;
    activeOtps.set(email, { otp, expiresAt });

    console.log(`Generated OTP for ${email}: ${otp} (Valid for 15 minutes)`);
    setTimeout(() => {
        activeOtps.delete(email);

        console.log(`OTP for ${email} has expired.`);
    }, 15 * 60 * 1000);
    return otp;
}



const sendResetPasswordMail = async (name, email, otp) => {
    try {
        console.log("hOst->", process.env.SMTP_HOST, "-", "USER->", process.env.SMTP_USER, "--", "Password->", process.env.SMTP_PASSWORD);

        const transporter = nodemailer.createTransport({
            host: 'live.smtp.mailtrap.io',
            //process.env.SMTP_HOST,
            port: 587,
            secure: false, // or 'STARTTLS'
            auth: {
                user: 'smtp@mailtrap.io',
                //process.env.SMTP_USER,
                pass: 'e2615854c9ae5998571b2d5435176c55'
                // process.env.SMTP_PASSWORD
            },
        });
        const mailOptions = {
            from: process.env.SMTP_EMAIL_USER,
            to: email,
            subject: 'For reset your password',
            html: `<p>Hi <strong>${name}</strong>,</p>
        <p>You recently requested to reset your password. Please use the following OTP to complete the process:</p>
        <h2 style="color: #4CAF50;">${otp}</h2>
        <p><strong>Note:</strong> This OTP is valid for the next <strong>15 minutes</strong>. If it expires, you will need to request a new one.</p>
        <p>If you did not request a password reset, please ignore this email or contact our support team for assistance.</p>
        <p>Thank you,<br>The <b>Printkendra Team</b></p>`
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error.message);
            }
            else {
                console.log("Email has been sent:-", info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }
}

const getUserApprovel = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        console.log(req.body);
        const { userStatus, userId, remark } = req.body
        if (isAdmin) {
            if (!userId || typeof userStatus !== "boolean") {
                throw new CustomError(
                    "User status and user id are required for admin to approve user.",
                    400
                )
            } else {
                const lastUser = await User.findOne({}, {}, { sort: { user_id: -1 } });
                const newUserId = lastUser ? lastUser.user_id + 1 : 1;
                if (userStatus == true) {
                    const isWalletExist = await Wallet.findOne({
                        userId: userId
                    })
                    if (!isWalletExist) {
                        await Wallet.create({
                            userId: userId,
                            balance: 0
                        })
                    }
                    await User.findOneAndUpdate({
                        _id: userId
                    }, {
                        $set: {
                            is_approved: 1,
                            user_id: newUserId
                        }
                    })
                    res.status(200).json({
                        message: "User approved successfully",
                        status: true
                    })
                } else if (userStatus == false) {
                    if (!remark) {
                        throw new CustomError(
                            "Remark is required for admin to reject the user approvel.",
                            400
                        )
                    }
                    await User.findOneAndUpdate({
                        _id: userId
                    }, {
                        $set: {
                            is_approved: 0,
                            remark: remark,
                        }
                    })
                    res.status(200).json({
                        message: "User rejected successfully",
                        status: true
                    })
                }
                else {
                    throw new CustomError("Invalid user status", 400)
                }
            }
        } else {
            throw new CustomError("You are not authorized to approve user", 401)
        }
    } catch (error) {
        console.error("Error when admin geting approvel for users:", error.message);
        next(error)
    }
}

const getApprovedUsers = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        if (isAdmin) {
            const approvedUsers = await User.find({ is_approved: 1 }).select("-password");
            if (approvedUsers) {
                res.status(200).json({
                    success: true,
                    data: approvedUsers,
                    message: "Get approved users!"
                });
            } else {
                throw new CustomError(
                    "No approved users found",
                    400
                )
            }
        }
        else {
            throw new CustomError("You are not authorized to view approved users", 401);
        }
    } catch (error) {
        console.error("Error when admin wants try get approved users:", error.message);
        next(error)
    }
}

const getUnapprovedUser = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        if (isAdmin) {
            const unapprovedUser = await User.find({ is_approved: 0 }).select("-password");
            if (unapprovedUser) {
                res.status(200).json({
                    success: true,
                    data: unapprovedUser,
                    message: "Get unapproved user!"
                });
            } else {
                throw new CustomError(
                    "No unapproved user found",
                    400
                )
            }
        } else {
            throw new CustomError("You are not authorized to view unapproved user", 401);
        }
    } catch (error) {
        console.error("Error when admin want to get unapproved users:", error.message);
        next(error)
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        if (isAdmin == 1) {
            const users = await User.find().select("-password");
            res.status(200).json({
                success: true,
                users: users
            });
        }
        else {
            throw new CustomError("You are not authorized to view all users", 401);
        }
    } catch (error) {
        console.error("Error when admin try to get all usres:", error.message);
        next(error)
    }
}


const newUser = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const { name, email, password, businessName, country, state, city, pinCode, GSTNumber, address, whatsAppNo } = reqBody;
        if (!email || !password || !name || !whatsAppNo || !address || !pinCode || !city || !state || !country || !businessName) {
            throw new CustomError("Please fill all the requried fields", 400);
        }
        const userData = await User.findOne({ email: email });
        const newPassword = await securePassword(password);
        if (userData) {
            throw new CustomError("User already exists", 400);

        } else {
            await User.create({
                name,
                email,
                password: newPassword,
                whatsAppNo,
                address,
                pinCode,
                city,
                state,
                country,
                businessName,
                GSTNumber,
                user_id: 0
            });
            res.status(201).json({ success: true, msg: "Registation Completed Successfully!" });
        }
    } catch (error) {
        console.error("Error when user wants to register hisself:", error.message);
        next(error)
    }
}

const userLogin = async (req, res, next) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;

        if (!email || !password) {
            throw new CustomError("Please fill all the fields", 400);
        }
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_approved == 1) {
                    const { balance } = await Wallet.findOne({ userId: userData._id }).select('balance -_id').lean();
                    const user = {
                        id: userData._id,
                        email: userData.email,
                        name: userData.name,
                        whatsAppNo: userData.whatsAppNo,
                    }
                    const token = await jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIREIN });
                    user.walletBalance = balance;
                    const response = {
                        success: true,
                        message: "User LogedIn",
                        token: token,
                        userData: user,
                    }
                    res.status(200).json(response);
                } else {
                    throw new CustomError("Your account is not approved, please Contact admin!", 403);
                }
            } else {
                throw new CustomError("Email Or Password Wrong!", 400);
            }
        } else {
            throw new CustomError("Email Or Password Wrong!", 400);
        }
    } catch (error) {
        console.error("Error when user wants to login on his profile:", error.message);
        next(error)
    }
}

const changePassword = async (req, res, next) => {
    try {
        const email = req.user.email;
        const reqBody = req.body;
        const { oldPassword, newPassword } = reqBody;
        if (!oldPassword || !newPassword) {
            throw new CustomError("Please fill all the fields", 400);
        }
        const userData = await User.findOne({
            email: email
        });
        const passwordMatch = await bcrypt.compare(oldPassword, userData.password);
        if (passwordMatch) {
            const hashedPassword = await securePassword(newPassword, 10);
            userData.password = hashedPassword;
            await userData.save();
            res.status(201).json({ success: true, msg: "Password Changed Successfully" });
        } else {
            throw new CustomError("Old Password is Wrong!", 401);

        }
    } catch (error) {
        console.error("Error changing password:", error.message);
        next(error)
    }
}


function verifyOtp(email, inputOtp) {
    const otpDetails = activeOtps.get(email);
    if (Date.now() > otpDetails.expiresAt) {
        activeOtps.delete(email); // Clean up expired OTP
        return { success: false, message: "OTP has expired." };
    }
    if (!otpDetails) {
        return { success: false, message: "OTP expired or not found" };
    }
    if (otpDetails.otp === parseInt(inputOtp)) {
        activeOtps.delete(email);
        return { success: true, message: "OTP verified successfully" };
    } else {
        return { success: false, message: "Invalid OTP" };
    }
}


const forgetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        if (!email) {
            throw new CustomError("Please provide email", 400)
        }
        const userDaitle = await User.findOne({
            email: email
        });
        if (userDaitle) {
            const otp = generateOtp(email);
            console.log(otp);
            await sendResetPasswordMail(userDaitle.name, email, otp);
            res.status(200).json({
                status: true,
                message: "Please check your mail for otp and reset your password",
            })
        } else {
            throw new CustomError("User not found", 404)
        }
    } catch (error) {
        console.error("Error when forgot password hit:", error.message);
        next(error)
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { otp, newPassword, email } = req.body;
        if (!otp || !newPassword || !email) {
            throw new CustomError("Please fill all the requried fields", 400)
        }
        const userDaitle = await User.findOne({
            email: email
        })
        if (userDaitle) {
            const otpIsValid = verifyOtp(email, otp)

            console.log(otpIsValid);
            if (otpIsValid.success == true) {

                const hashedPassword = await securePassword(newPassword)
                userDaitle.password = hashedPassword;
                await userDaitle.save();
                res.status(200).
                    json({
                        status: true,
                        message: "Password Reset Successfully",
                    })
            } else {
                throw new CustomError(`${otpIsValid.message}`, 400)
            }
        } else {
            throw new CustomError("User not found", 404)
        }
    } catch (error) {
        console.error("Error trying to reset password:", error.message);
        next(error)
    }
}

const updateUserProfile = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        const userId = req.user.id;
        const user_id = req.body._id;
        const fUserId = userId || user_id
        const { name, phone } = req.body;
        const userDaitle = await User.findOne({
            _id: fUserId
        }).select('-password');
        if (userDaitle) {
            if (isAdmin) {
                const userDaitles = await User.findOneAndUpdate({
                    _id: fUserId
                }, req.body, { new: true, fields: { password: 0 } });
                res.status(200).
                    json({
                        status: true,
                        message: "Profile Updated Successfully",
                        userDaitles
                    })
            } else if (userId) {
                if (condition) {

                } else {

                }
                userDaitle.name = name;
                userDaitle.phone = phone;
                await userDaitle.save();
                res.status(200).
                    json({
                        status: true,
                        message: "Profile Updated Successfully",
                    })
            }
        } else {
            throw new CustomError("User not found", 404)
        }
    } catch (error) {
        console.error("Error when user want to update his profile:", error.message);
        next(error)
    }
}

const getWalletBalance = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const userWallet = await Wallet.findOne({
            userId: userId
        });
        if (userWallet) {
            res.status(200).json({
                status: true,
                message: "Your Wallet Balance",
                balance: userWallet.balance,
            })
        }
        else {
            throw new CustomError("Wallet not found", 404)
        }
    }
    catch (error) {
        console.error("Error when user want to get his wallet balence:", error.message);
        next(error)
    }
}

const getUserDaitles = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        const userId = req.user.id;
        const user_id = req.body._id;
        const fUserId = userId || user_id
        if (isAdmin || userId) {
            if (fUserId) {
                const userDaitle = await User.findOne({ _id: fUserId });
                if (userDaitle) {
                    res.status(200).json({
                        status: true,
                        message: "User Daitle",
                        data: userDaitle
                    })
                }
            } else {
                throw new CustomError("User not found", 404)
            }
        } else {
            throw new CustomError("You are not authorized to access this route", 403)
        }
    } catch (error) {
        console.error("Error getting user details :", error.message);
        next(error)
    }
}

const updateBalance = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin
        const userId = req.body._id;
        const amount = req.body.amount;
        if (isAdmin) {
            const userWallet = await Wallet.findOne({ userId: userId });
            if (userWallet) {
                userWallet.balance += amount;
                await userWallet.save();
                res.status(200).json({
                    status: true,
                    message: "Balance updated successfully",
                    data: userWallet
                })
            } else {
                throw new CustomError("User wallet not found", 404)
            }
        } else {
            throw new CustomError("You are not authorized to access this route", 403)
        }
    } catch (error) {
        console.error("Error getting user details :", error.message);
        next(error)
    }
}

module.exports = {
    newUser,
    userLogin,
    updateUserProfile,
    changePassword,
    forgetPassword,
    resetPassword,
    generateOtp,
    verifyOtp,
    sendResetPasswordMail,
    securePassword,
    getUserApprovel,
    getApprovedUsers,
    getAllUsers,
    getUnapprovedUser,
    getWalletBalance,
    getUserDaitles,
    updateBalance
}