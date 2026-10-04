const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Verifies the JWT sent in the Authorization header and attaches
 * the authenticated (fresh, DB-backed) user to req.user.
 * The role on req.user always comes from the database, never from
 * anything the client sent — so the frontend cannot fake a role.
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Please log in to continue.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};

/**
 * Restricts a route to specific roles. Always checks req.user.role,
 * which was loaded from the database in `protect`, never from the request body.
 */
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to do that.' });
  }
  next();
};
