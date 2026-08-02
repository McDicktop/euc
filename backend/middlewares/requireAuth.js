const jwt = require("jsonwebtoken");

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

module.exports = { requireAuth };