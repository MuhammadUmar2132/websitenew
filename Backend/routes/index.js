const express = require('express');
const router = express.Router();

const authController = require("../controller/authController");
const photoController = require('../controller/photo');
const contactController = require('../controller/contact');
const adminController = require('../controller/adminController');

const { auth, adminAuth } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const validateContact = require('../middlewares/validateContact');

// -------- Health Check --------
router.get('/', (req, res) => res.json({ msg: 'Portfolio API is running smoothly' }));

// -------- User Auth --------
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/refresh', authController.refresh);
router.get('/me', auth, authController.me);

// -------- Projects / Photos --------
router.get('/photos', photoController.getAllPhotos);
router.get('/photos/:id', photoController.getPhotoById);
router.post('/upload-photo', upload.single('image'), photoController.uploadPhoto);
router.put('/update-photo/:id', upload.single('image'), photoController.updatePhoto);
router.delete('/delete-photo/:id', photoController.deletePhoto);
router.delete('/photo/title/:title', photoController.deletePhotoByTitle);

// -------- Public Contact Form / Leads --------
router.post('/contact', validateContact, contactController.sendMessage);

// -------- Admin Dashboard & Management Routes --------
// Stats
router.get('/admin/stats', auth, adminAuth, adminController.getStats);

// User Management (CRUD)
router.get('/admin/users', auth, adminAuth, adminController.getAllUsers);
router.post('/admin/users', auth, adminAuth, adminController.createUser);
router.put('/admin/users/:id', auth, adminAuth, adminController.updateUser);
router.delete('/admin/users/:id', auth, adminAuth, adminController.deleteUser);

// Leads / Contact Management (CRUD & Status)
router.get('/admin/leads', auth, adminAuth, adminController.getAllLeads);
router.put('/admin/leads/:id', auth, adminAuth, adminController.updateLead);
router.delete('/admin/leads/:id', auth, adminAuth, adminController.deleteLead);

// -------- Exports --------
module.exports = router;
