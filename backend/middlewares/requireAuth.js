const jwt = require("jsonwebtoken");
const User = require("../models/user")

function requireAuth(req, res, next) {

    // const authHeader = req.header.authorization; 


    const authHeader = req.get('authorization');

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authorization token is missing",
            error: "NO_ACCESS_TOKEN"
        })
    }

    const token = authHeader.slice("Bearer ".length);

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.userId = payload.sub;
        next();
    } catch(e) {
        return res.status(401).json({
            message: "Access token is invalid or expired",
            error: "NO_ACCESS_TOKEN"
        })
    }
}


function requireRole(...roles) {
    return async (req, res, next) => {
        
        if(!req.userId) {
            return res.status(401).json({
                message: "Sign in to your account",
                error: "NO_ACCESS_TOKEN"
            })
        }

        let user;
        try {
            user = await User.findById(req.userId).select("role")
        } catch (error) {
            return next(error)
        }

        

        if(!user) {
            return res.status(404).json({
                message: "User not found",
                error: "USER_NOT_FOUND"
            })
        }

        if (!roles.includes(user.role)) {
            return res.status(403).json({
                message: "Access denied",
                error: "FORBIDDEN"
            })
        }

        next()
    }
}

const requireAdmin = requireRole("admin")

module.exports = { requireAuth, requireRole, requireAdmin };