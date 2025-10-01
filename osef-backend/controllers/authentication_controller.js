const jwt = require('jsonwebtoken');
const UserModel = require('../models/user_model');
const sha256 = require('js-sha256');

// Login method that will check if the user exists and if the password is correct returns a token
const login = async (req, res) => {
    const { email, password } = req.body;
    
    const user = await UserModel.findByEmail(email);
    if (!user) {
       return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (user.password !== sha256(password + process.env.SALT)) {
       return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ token });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ message: 'No authorization header provided' })
    }
    
    const token = authHeader.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' })
        }
        req.user = decoded
        next()
    })
}

module.exports = { login, verifyToken }
