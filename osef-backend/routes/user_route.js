const express = require('express')
const router = express.Router()
const userController = require('../controllers/user_controller')
const authenticationController = require('../controllers/authentication_controller')

router.post('/', userController.createUser)
router.get('/', authenticationController.verifyToken, userController.getUsers)
router.get('/:id', authenticationController.verifyToken, userController.getUserById)
router.put('/:id', authenticationController.verifyToken, userController.updateUser)
router.delete('/:id', authenticationController.verifyToken, userController.deleteUser)

module.exports = router