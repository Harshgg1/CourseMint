const express = require('express');
const { prisma } = require("../db");
const jwt = require('jsonwebtoken');
const { SECRET } = require("../middleware/auth")
const { authenticateJwt } = require("../middleware/auth");

const router = express.Router();

router.get("/me", authenticateJwt, async (req, res) => {
    const admin = await prisma.admin.findUnique({ where: { username: req.user.username } });
    if (!admin) {
      res.status(403).json({msg: "Admin doesnt exist"})
      return
    }
    res.json({
        username: admin.username
    })
});

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (admin) {
      res.status(403).json({ message: 'Admin already exists' });
    } else {
      await prisma.admin.create({ data: { username, password } });
      const token = jwt.sign({ username, role: 'admin' }, SECRET, { expiresIn: '1h' });
      res.json({ message: 'Admin created successfully', token });
    }
});
  
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await prisma.admin.findFirst({ where: { username, password } });
    if (admin) {
        const token = jwt.sign({ username, role: 'admin' }, SECRET, { expiresIn: '1h' });
        res.json({ message: 'Logged in successfully', token });
    } else {
        res.status(403).json({ message: 'Invalid username or password' });
    }
});
  
router.post('/courses', authenticateJwt, async (req, res) => {
    const course = await prisma.course.create({ data: req.body });
    res.json({ message: 'Course created successfully', courseId: course.id });
});
  
router.put('/courses/:courseId', authenticateJwt, async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = await prisma.course.update({
        where: { id: courseId },
        data: req.body
    }).catch(() => null);

    if (course) {
        res.json({ message: 'Course updated successfully' });
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
});
  
router.get('/courses', authenticateJwt, async (req, res) => {
    const courses = await prisma.course.findMany({});
    res.json({ courses });
});
  
router.get('/course/:courseId', authenticateJwt, async (req, res) => {
    const courseId = parseInt(req.params.courseId);
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    res.json({ course });
});

module.exports = router