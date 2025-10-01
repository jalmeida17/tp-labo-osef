const { EventModel, EventUserModel } = require('../models/event_model');

const createEvent = async (req, res) => {
    try {
        const { startDate, endDate, title, description, affectedUsers } = req.body;
        const { id, role } = req.user;
        
        // Check if user has admin role
        if (role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Only admins can create events." });
        }
        
        const eventId = await EventModel.create({ 
            startDate: startDate, 
            endDate: endDate, 
            title: title, 
            description: description, 
            createdBy: id
        });
        
        // Add affected users if provided
        if (affectedUsers && affectedUsers.length > 0) {
            for (const userId of affectedUsers) {
                await EventUserModel.addUserToEvent(eventId, userId);
            }
        }
        
        const event = await EventModel.findById(eventId);
        res.status(201).json(event);
    } catch (error) { 
        console.error('Error creating event:', error);
        res.status(500).json({ message: "Server error" });
    }
};

const getEvents = async (req, res) => {
    try {
        const { id, role } = req.user;
        let events;
        
        if (role === 'admin') {
            // Admins can see all events
            events = await EventModel.findAll();
            
            // Add affected users for each event
            for (let event of events) {
                event.affectedUsers = await EventUserModel.getUsersForEvent(event.id);
            }
        } else {
            // Regular users can only see events where they are affected
            events = await EventUserModel.getEventsForUser(id);
            
            // Add affected users for each event
            for (let event of events) {
                event.affectedUsers = await EventUserModel.getUsersForEvent(event.id);
            }
        }
        res.status(200).json(events);
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ message: "Server error" });
    }
};

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const eventId = parseInt(id);
        if (isNaN(eventId)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        
        const event = await EventModel.findById(eventId);
        if (!event) {
            throw new Error('Event not found', { cause: 404 });
        }
        
        // Add affected users
        event.affectedUsers = await EventUserModel.getUsersForEvent(eventId);
        
        res.status(200).json(event);
    } catch (error) {
        if (error['cause'] === 404) {
            res.status(404).json({ message: error.message });
        } else {
            console.error('Error getting event by id:', error);
            res.status(500).json({ message: "Server error" });
        }
    }
};

const updateEvent = async (req, res) => {
    console.log("Update event called");
    try {
        const { id } = req.params;
        const { startDate, endDate, title, description, affectedUsers } = req.body;
        const { role } = req.user;
        
        
        // Check if user has admin role
        if (role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Only admins can update events." });
        }
        
        // Convert id to integer
        const eventId = parseInt(id);
        if (isNaN(eventId)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        
        // Check if event exists
        const existingEvent = await EventModel.findById(eventId);
        console.log(existingEvent);
        console.log(eventId, id);
        if (!existingEvent) {
            return res.status(404).json({ message: "Event not found" });
        }
        
        // Build update object with only provided fields
        const updateData = {
            startDate: startDate !== undefined ? startDate : existingEvent.startDate,
            endDate: endDate !== undefined ? endDate : existingEvent.endDate,
            title: title !== undefined ? title : existingEvent.title,
            description: description !== undefined ? description : existingEvent.description
        };
        
        const updated = await EventModel.update(eventId, updateData);
        
        if (!updated) {
            return res.status(500).json({ message: "Failed to update event" });
        }
        
        // Update affected users if provided
        if (affectedUsers) {
            // Remove all existing associations
            const existingUsers = await EventUserModel.getUsersForEvent(eventId);
            for (const user of existingUsers) {
                await EventUserModel.removeUserFromEvent(eventId, user.id);
            }
            
            // Add new associations
            for (const userId of affectedUsers) {
                await EventUserModel.addUserToEvent(eventId, userId);
            }
        }
        
        const event = await EventModel.findById(eventId);
        event.affectedUsers = await EventUserModel.getUsersForEvent(eventId);
        
        res.status(200).json(event);
    } catch (error) {
        if (error['cause'] === 404) {
            res.status(404).json({ message: error.message });
        } else {
            console.error('Error updating event:', error);
            res.status(500).json({ message: "Server error" });
        }
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;
        
        // Check if user has admin role
        if (role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Only admins can delete events." });
        }
        
        const eventId = parseInt(id);
        if (isNaN(eventId)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }
        
        const deleted = await EventModel.delete(eventId);
        if (!deleted) {
            throw new Error('Event not found', { cause: 404 });
        }
        res.status(200).json({ message: 'Event deleted' });
    } catch (error) {
        if (error['cause'] === 404) {
            res.status(404).json({ message: error.message });
        } else {
            console.error('Error deleting event:', error);
            res.status(500).json({ message: "Server error" });
        }
    }
};

module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent }