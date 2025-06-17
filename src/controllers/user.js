const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // optional, for token generation
const { User } = require('../models'); // Adjust to your actual User model import

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare passwords
    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        isMatch =  await bcrypt.compare(password, user.password.replace(/^\$2y\$/, '$2b$'));
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password.' });
        }
    }

    // Generate token (optional)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '1h' }
    );

    // Respond with token and user info (customize as needed)
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login };