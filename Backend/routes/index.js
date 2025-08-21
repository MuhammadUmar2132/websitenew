const express = require('express');
const router = express.Router();

const authController = require("../controller/authController");
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const photoController = require('../controller/photo');
const contactController = require('../controller/Contact');
const validateContact = require('../middlewares/validateContact');

// -------- User Auth --------
router.get('/', (req, res) => res.json({ msg: 'Hello World123' }));

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', auth, authController.logout);
router.get('/refresh', authController.refresh);

// -------- Photo Upload --------
router.post('/upload-photo', upload.single('image'), photoController.uploadPhoto);
router.get('/photos', photoController.getAllPhotos);
// Update
router.put('/update-photo/:id', upload.single('file'), photoController.updatePhoto);
// Delete

router.delete('/delete-photo/:id', photoController.deletePhoto);

//delete by title
router.delete('/photo/title/:title', photoController.deletePhotoByTitle);

// -------- Contact --------
router.post('/contact', validateContact, contactController.sendMessage);

// -------- Exports --------
module.exports = router;
