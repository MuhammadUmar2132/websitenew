const Joi = require("joi");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");
const RefreshToken = require("../models/token");

const authController = {
    async register(req, res, next) {
        const userRegistrationSchema = Joi.object({
            username: Joi.string().min(3).max(30).required(),
            name: Joi.string().max(50).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(50).required(),
            role: Joi.string().valid('user', 'admin').default('user'),
        });

        const { error } = userRegistrationSchema.validate(req.body);
        if (error) return next(error);

        const { username, name, email, password, role } = req.body;

        try {
            const emailInUse = await User.exists({ email });
            const usernameInUse = await User.exists({ username });

            if (emailInUse) {
                return next({
                    status: 409,
                    message: "Email already registered, use another email",
                });
            }
            if (usernameInUse) {
                return next({
                    status: 409,
                    message: "Username not available, please use another username",
                });
            }
        } catch (error) {
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let user, accessToken, refreshToken;
        try {
            const userToRegister = new User({
                username,
                email,
                name,
                password: hashedPassword,
                role: role || 'user',
            });
            user = await userToRegister.save();

            accessToken = JWTService.signAccessToken({ _id: user._id }, "24h");
            refreshToken = JWTService.signRefreshToken({ _id: user._id }, "7d");
            await JWTService.storeRefreshToken(refreshToken, user._id);
        } catch (error) {
            return next(error);
        }

        res.cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
        });
        res.cookie("refreshToken", refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
        });

        const userDto = new UserDTO(user);
        return res.status(201).json({ user: userDto, token: accessToken, auth: true });
    },

    async login(req, res, next) {
        const userLoginSchema = Joi.object({
            username: Joi.string().min(3).max(50).required(),
            password: Joi.string().min(6).max(50).required(),
        });

        const { error } = userLoginSchema.validate(req.body);
        if (error) return next(error);

        const { username, password } = req.body;

        let user;
        try {
            // Check by username OR email
            user = await User.findOne({
                $or: [{ username: username }, { email: username }]
            });

            if (!user) {
                return next({ status: 401, message: "Invalid credentials" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return next({ status: 401, message: "Invalid credentials" });
            }

            const accessToken = JWTService.signAccessToken({ _id: user._id }, "24h");
            const refreshToken = JWTService.signRefreshToken({ _id: user._id }, "7d");

            await RefreshToken.updateOne(
                { _id: user._id },
                { token: refreshToken },
                { upsert: true }
            );

            res.cookie("accessToken", accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
            });
            res.cookie("refreshToken", refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
            });

            const userDto = new UserDTO(user);
            return res.status(200).json({ user: userDto, token: accessToken, auth: true });
        } catch (error) {
            return next(error);
        }
    },

    async me(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Not authenticated" });
            }
            return res.status(200).json({ user: req.user, auth: true });
        } catch (error) {
            return next(error);
        }
    },

    async refresh(req, res, next) {
        const originalRefreshToken = req.cookies.refreshToken;
        let id;

        try {
            id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
        } catch (e) {
            return next({ status: 401, message: "Unauthorized" });
        }

        try {
            const match = await RefreshToken.findOne({
                _id: id,
                token: originalRefreshToken,
            });

            if (!match) {
                return next({ status: 401, message: "Unauthorized" });
            }
        } catch (e) {
            return next(e);
        }

        try {
            const accessToken = JWTService.signAccessToken({ _id: id }, "24h");
            const refreshToken = JWTService.signRefreshToken({ _id: id }, "7d");

            await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

            res.cookie("accessToken", accessToken, {
                maxAge: 1000 * 60 * 60 * 24,
                httpOnly: true,
            });

            res.cookie("refreshToken", refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                httpOnly: true,
            });

            const user = await User.findOne({ _id: id });
            const userDto = new UserDTO(user);
            return res.status(200).json({ user: userDto, token: accessToken, auth: true });
        } catch (e) {
            return next(e);
        }
    },

    async logout(req, res, next) {
        const { refreshToken } = req.cookies;
        try {
            if (refreshToken) {
                await RefreshToken.deleteOne({ token: refreshToken });
            }
        } catch (error) {
            return next(error);
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        res.status(200).json({ user: null, auth: false });
    },
};

module.exports = authController;
