const { getAuth } = require("firebase-admin/auth");
const firebaseAdmin = require("../config/firebaseAdmin");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing authentication token",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    const decodedToken = await getAuth(firebaseAdmin).verifyIdToken(idToken);

    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Authentication failed:", error.message);

    return res.status(401).json({
      error: "Invalid authentication token",
    });
  }
};

module.exports = authenticate;