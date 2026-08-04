function sendError(res, status, error, message, details) {
    return res
        .status(status)
        .json({ message, error, ...(details ? { details } : {}) });
}

module.exports =  { sendError }