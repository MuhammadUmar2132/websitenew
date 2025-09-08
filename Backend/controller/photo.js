const Photo = require('../models/Photo.js');
const PhotoDTO = require('../dto/photo.dto.js');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// UPLOAD PHOTO
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'photos' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await uploadStream();

    const newPhoto = new Photo({
      title: req.body.title,
      description: req.body.description,
      link: req.body.link,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id
    });

    const savedPhoto = await newPhoto.save();
    res.status(201).json(new PhotoDTO(savedPhoto));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// GET ALL PHOTOS
exports.getAllPhotos = async (req, res) => {
  try {
    const photos = await Photo.find().sort({ createdAt: -1 });
    const photoDTOs = photos.map(photo => new PhotoDTO(photo));
    res.status(200).json(photoDTOs);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Failed to retrieve photos', error: error.message });
  }
};

// UPDATE PHOTO
exports.updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link } = req.body;

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // If a new file is uploaded
    if (req.file) {
      // Delete old image
      await cloudinary.uploader.destroy(photo.cloudinaryId);

      // Upload new image
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'photos' },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await uploadStream();
      photo.imageUrl = result.secure_url;
      photo.cloudinaryId = result.public_id;
    }

    // Update fields
    photo.title = title;
    photo.description = description;
    photo.link = link;

    const updatedPhoto = await photo.save();
    res.json(new PhotoDTO(updatedPhoto));
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// DELETE PHOTO
exports.deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.cloudinaryId);

    // Delete from MongoDB
    await photo.deleteOne();

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};
//Delete by Tittle
// DELETE PHOTO BY TITLE
exports.deletePhotoByTitle = async (req, res) => {
  try {
    const { title } = req.params;

    // Find the photo by title
    const photo = await Photo.findOne({ title });
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(photo.cloudinaryId);

    // Delete from MongoDB
    await photo.deleteOne();

    res.status(200).json({ message: `Photo with title '${title}' deleted successfully` });
  } catch (error) {
    console.error('Delete by title error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

