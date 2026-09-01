const User = require('../models/user');
const UserDTO = require('../dto/user');
const Contact = require('../models/Contact');
const ContactDTO = require('../dto/contact.dto');
const Photo = require('../models/Photo');
const PhotoDTO = require('../dto/photo.dto');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const adminController = {
  // 1. DASHBOARD STATS
  async getStats(req, res, next) {
    try {
      const [totalUsers, totalProjects, totalLeads, pendingLeads] = await Promise.all([
        User.countDocuments(),
        Photo.countDocuments(),
        Contact.countDocuments(),
        Contact.countDocuments({ status: 'pending' })
      ]);

      const recentLeads = await Contact.find().sort({ createdAt: -1 }).limit(5);
      const recentProjects = await Photo.find().sort({ createdAt: -1 }).limit(5);

      return res.status(200).json({
        stats: {
          totalUsers,
          totalProjects,
          totalLeads,
          pendingLeads
        },
        recentLeads: recentLeads.map(l => new ContactDTO(l)),
        recentProjects: recentProjects.map(p => new PhotoDTO(p))
      });
    } catch (error) {
      return next(error);
    }
  },

  // 2. USER MANAGEMENT CRUD
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      const userDTOs = users.map(user => new UserDTO(user));
      return res.status(200).json(userDTOs);
    } catch (error) {
      return next(error);
    }
  },

  async createUser(req, res, next) {
    const userSchema = Joi.object({
      name: Joi.string().max(50).required(),
      username: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid('user', 'admin').default('user'),
    });

    const { error } = userSchema.validate(req.body);
    if (error) return next(error);

    const { name, username, email, password, role } = req.body;

    try {
      const emailExists = await User.exists({ email });
      if (emailExists) {
        return res.status(409).json({ message: 'Email already exists' });
      }

      const usernameExists = await User.exists({ username });
      if (usernameExists) {
        return res.status(409).json({ message: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        username,
        email,
        password: hashedPassword,
        role: role || 'user',
      });

      const savedUser = await newUser.save();
      return res.status(201).json(new UserDTO(savedUser));
    } catch (error) {
      return next(error);
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, username, email, password, role } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if username/email belongs to another user
      if (username && username !== user.username) {
        const usernameTaken = await User.findOne({ username, _id: { $ne: id } });
        if (usernameTaken) {
          return res.status(409).json({ message: 'Username is already taken' });
        }
        user.username = username;
      }

      if (email && email !== user.email) {
        const emailTaken = await User.findOne({ email, _id: { $ne: id } });
        if (emailTaken) {
          return res.status(409).json({ message: 'Email is already registered' });
        }
        user.email = email;
      }

      if (name) user.name = name;
      if (role && ['user', 'admin'].includes(role)) user.role = role;

      if (password && password.trim().length >= 6) {
        user.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await user.save();
      return res.status(200).json(new UserDTO(updatedUser));
    } catch (error) {
      return next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Prevent deleting self if same user
      if (req.user && req.user._id && req.user._id.toString() === id.toString()) {
        return res.status(400).json({ message: 'You cannot delete your own logged in admin account' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await User.findByIdAndDelete(id);
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return next(error);
    }
  },

  // 3. LEADS / CONTACT INQUIRIES MANAGEMENT
  async getAllLeads(req, res, next) {
    try {
      const { status } = req.query;
      const filter = status && ['pending', 'contacted', 'resolved'].includes(status) ? { status } : {};
      const leads = await Contact.find(filter).sort({ createdAt: -1 });
      const leadDTOs = leads.map(lead => new ContactDTO(lead));
      return res.status(200).json(leadDTOs);
    } catch (error) {
      return next(error);
    }
  },

  async updateLead(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes, name, email, phone, message } = req.body;

      const lead = await Contact.findById(id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      if (status && ['pending', 'contacted', 'resolved'].includes(status)) {
        lead.status = status;
      }
      if (notes !== undefined) lead.notes = notes;
      if (name) lead.name = name;
      if (email) lead.email = email;
      if (phone !== undefined) lead.phone = phone;
      if (message) lead.message = message;

      const updatedLead = await lead.save();
      return res.status(200).json(new ContactDTO(updatedLead));
    } catch (error) {
      return next(error);
    }
  },

  async deleteLead(req, res, next) {
    try {
      const { id } = req.params;
      const lead = await Contact.findById(id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      await Contact.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (error) {
      return next(error);
    }
  }
};

module.exports = adminController;
