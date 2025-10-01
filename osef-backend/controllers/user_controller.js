const { sha256 } = require('js-sha256');
const UserModel = require('../models/user_model');

const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = await UserModel.create({ name, email, password, role: "user" });
        const user = await UserModel.findById(userId);
        res.status(201).json(user);
    } catch (error) {
        if (error.message === 'User already exists') {
            res.status(400).json({ message: 'User already exists' });
        } else {
            res.status(500).json({ message: "Server error" });
        }
    }
};

const getUsers = async (req, res) => {
    try {
        let users;
        if (req.query.email) {
            const user = await UserModel.findByEmail(req.query.email);
            users = user ? [user] : [];
        } else {
            users = await UserModel.findAll();
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) {
            throw new Error('User not found', { cause: 404 });
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        if (error['cause'] === 404) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Server error" });
        }
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await UserModel.findById(id);
        if (!existingUser) {
            throw new Error('User not found', { cause: 404 });
        }
        
        const updateData = {
            name: name !== undefined ? name : existingUser.name,
            email: email !== undefined ? email : existingUser.email,
            role: existingUser.role
        };
        
        // Handle password update separately if provided
        if (password !== undefined) {
            updateData.password = sha256(password + process.env.SALT);
        }
        
        const updated = await UserModel.update(id, updateData);
        
        if (!updated) {
            throw new Error('Failed to update user');
        }
        
        const user = await UserModel.findById(id);
        res.status(200).json(user);
    } catch (error) {
        if (error['cause'] === 404) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: "Server error" });
        }
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await UserModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser }

