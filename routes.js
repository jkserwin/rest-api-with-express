'use strict';

const express = require('express');
const { asyncHandler } = require('./middleware/async-handler');
const { User } = require('./models');
const { Course } = require('./models');
const { authenticateUser } = require('./middleware/auth-user');
const e = require('express');

// Construct a router instance.
const router = express.Router();

// Route that returns all properties and values for the currently authenticated User.
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;

  res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
  });
}));

// Route that creates a new user.
router.post('/users', asyncHandler(async (req, res) => {
    try {
        await User.create(req.body);
        res.status(201).setHeader('Location', '/').end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// Route that returns all courses and associated users.
router.get('/courses', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
        attributes: [ 'title', 'description', 'estimatedTime', 'materialsNeeded' ],
        include: [
            {
                model: User,
                attributes: [ 'firstName', 'lastName', 'emailAddress' ]
            }
        ]
    });
    res.status(200).json(courses);
}));

// Route that returns a specific course and associated users.
router.get('/courses/:id', asyncHandler(async (req,res) => {
    const course = await Course.findOne({
        where: { id: req.params.id },
        include: [
            {
                model: User,
                attributes: [ 'firstName', 'lastName', 'emailAddress' ]
            }
        ]
    });
    res.status(200).json(course);
}));

// Route that creates a new course.
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
    try {
        let course = await Course.create(req.body);
        res.status(201).setHeader('Location', `/courses/${course.id}`).end();
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// Route that updates a specific course.
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    try {
        let course = await Course.findOne({ where: { id: req.params.id } });
        const user = req.currentUser;
        if (course) {
            if (user.id === course.userId) {
                await course.update(req.body);
                res.status(204).end();
            } else {
                res.status(403).json({error: {message: 'Only users associated with this course can make changes'}});
            }
        } else {
            res.status(404).json({error: {message: `Course not found with id of ${req.params.id}`}});
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

// Route that deletes a specific course.
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
    try {
        let course = await Course.findOne({ where: { id: req.params.id } });
        const user = req.currentUser;
        if (course) {
            if (user.id === course.userId) {
                await course.destroy();
                res.status(204).end();
            } else {
                res.status(403).json({error: {message: 'Only users associated with this course can make changes'}});
            }
        } else {
            res.status(404).json({error: {message: `Course not found with id of ${req.params.id}`}});
        }
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

module.exports = router;