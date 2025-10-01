const express = require('express')
const router = express.Router()
const eventController = require('../controllers/event_controller')
const authenticationController = require('../controllers/authentication_controller')


router.post('/', authenticationController.verifyToken, eventController.createEvent)
router.get('/', authenticationController.verifyToken, eventController.getEvents)
router.get('/:id', authenticationController.verifyToken, eventController.getEventById)
router.put('/:id', authenticationController.verifyToken, eventController.updateEvent)
router.delete('/:id', authenticationController.verifyToken, eventController.deleteEvent)

module.exports = router
