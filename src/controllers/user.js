const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // optional, for token generation
const {
  User,
  ModelHasRoles,
  UserAffiliate,
  CustomerProfile,
} = require("../models"); // Add CustomerProfile to the import
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
      user,
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

    // Create user (without number/whatsapp/gender, those go to customer_profiles)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      number,
      whatsapp,
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

const getProfile = async function (req, res) {
  const userId = req.user && req.user.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "Customer",
      phone: user.number || "",
      whatsapp: user.whatsapp || "",
      affiliate: user.affiliate || "",
      gender: user.gender || "Male",
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const setProfile = async function (req, res) {
  const userId = req.user && req.user.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { name, email, phone, whatsapp, gender } = req.body;
    // Update User fields
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.number = phone;
    if (whatsapp) user.whatsapp = whatsapp;
    if (gender) user.gender = gender;
    await user.save();

    res.json({ message: "Profile updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAddresses = async function (req, res) {
  const userId = req.user && req.user.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const addresses = await CustomerProfile.findAll({
      where: { user_id: userId },
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const saveAddress = async function (req, res) {
  const userId = req.user && req.user.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const {
      address_id,
      buildingName,
      area,
      landmark,
      flatVilla,
      street,
      city,
      district,
    } = req.body;
    let address;
    if (address_id) {
      address = await CustomerProfile.findOne({
        where: { id: address_id, user_id: userId },
      });
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      if (buildingName !== undefined) address.buildingName = buildingName;
      if (area !== undefined) address.area = area;
      if (landmark !== undefined) address.landmark = landmark;
      if (flatVilla !== undefined) address.flatVilla = flatVilla;
      if (street !== undefined) address.street = street;
      if (city !== undefined) address.city = city;
      if (district !== undefined) address.district = district;
      await address.save();
    } else {
      address = await CustomerProfile.create({
        user_id: userId,
        buildingName,
        area,
        landmark,
        flatVilla,
        street,
        city,
        district,
      });
    }
    res.json({ message: "Address saved successfully", address });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteAddress = async function (req, res) {
  const userId = req.user && req.user.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const { address_id } = req.body;
    if (!address_id) {
      return res.status(400).json({ message: "Address ID is required" });
    }
    const address = await CustomerProfile.findOne({
      where: { id: address_id },
    });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    await address.destroy();
    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  setProfile,
  getAddresses,
  saveAddress,
  deleteAddress,
};
