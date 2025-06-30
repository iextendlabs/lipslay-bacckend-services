const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // optional, for token generation
const { User, ModelHasRoles, UserAffiliate } = require("../models"); // Add UserAffiliate to the import
const { Role } = require("../models"); // You need to define a Role model for the 'roles' table
const Affiliate = require("../models/Affiliate"); // Add this at the top with other imports

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare passwords
    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      isMatch = await bcrypt.compare(
        password,
        user.password.replace(/^\$2y\$/, "$2b$")
      );
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
    }

    // Generate token (optional)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "changeme",
      { expiresIn: "1h" }
    );

    // Respond with token and user info (customize as needed)
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Registration endpoint
const register = async (req, res) => {
  try {
    const { name, email, password, number, whatsapp, affiliate_code, gender } =
      req.body;

    // Check for required fields
    if (
      !name ||
      !email ||
      !password ||
      !number ||
      !whatsapp ||
      !affiliate_code ||
      !gender
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // If affiliate_code is provided, check if it exists in affiliates table
    let affiliate = null;
    if (affiliate_code) {
      affiliate = await Affiliate.findOne({
        where: { code: affiliate_code },
      });
      if (!affiliate) {
        return res
          .status(400)
          .json({ message: "Affiliate code does not exist." });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      number,
      whatsapp,
      affiliate_code,
      gender,
    });

    // Assign role after user creation
    await ModelHasRoles.create({
      role_id: 3,
      model_type: "App\\Models\\User",
      model_id: newUser.id,
    });

    // If affiliate_code exists, add entry to user_affiliate
    if (affiliate) {
      await UserAffiliate.create({
        user_id: newUser.id,
        affiliate_id: affiliate.user_id,
      });
    }

    return res
      .status(201)
      .json({ message: "User registered successfully.", userId: newUser.id });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login, register };
