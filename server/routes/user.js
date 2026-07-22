const express = require('express');
const { authenticateJwt, SECRET } = require("../middleware/auth");
const { prisma } = require("../db");
const jwt = require('jsonwebtoken');
const router = express.Router();


router.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (user) {
    res.status(403).json({ message: 'User already exists' });
  } else {
    await prisma.user.create({ data: { username, password } });
    const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'User created successfully', token });
  }
});
  
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findFirst({ where: { username, password } });
  if (user) {
    const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'Invalid username or password' });
  }
});
  
router.get('/courses', authenticateJwt, async (req, res) => {
  const courses = await prisma.course.findMany({ where: { published: true } });
  res.json({ courses });
});
  
router.post('/courses/:courseId', authenticateJwt, async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (course) {
    const user = await prisma.user.findUnique({ where: { username: req.user.username } });
    if (user) {
      await prisma.user.update({
        where: { username: req.user.username },
        data: {
          purchasedCourses: {
            connect: { id: course.id }
          }
        }
      });
      res.json({ message: 'Course purchased successfully' });
    } else {
      res.status(403).json({ message: 'User not found' });
    }
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});
  
router.get('/purchasedCourses', authenticateJwt, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.user.username },
    include: { purchasedCourses: true }
  });
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: 'User not found' });
  }
});
  
module.exports = router