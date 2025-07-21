const { Complaint, ComplaintChat, User } = require("../models");

// Create complaint
const create = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { title, description, status, order_id } = req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required" });
  }
  try {
    const complaint = await Complaint.create({
      title,
      description,
      status: status || "open",
      user_id: userId,
      order_id,
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// View complaint by ID
const view = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [
        {
          model: ComplaintChat,
          as: "chats",
        },
      ],
    });
    if (!complaint) return res.status(404).json({ error: "Not found" });

    // Convert to plain object
    const complaintObj = complaint.toJSON();

    // Add 'self' property to each chat
    if (complaintObj.chats && Array.isArray(complaintObj.chats)) {
      complaintObj.chats = complaintObj.chats.map((chat) => ({
        ...chat,
        self: chat.user_id === userId,
      }));
    }

    res.json(complaintObj);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List complaints (optionally filter by user)
const list = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const complaints = await Complaint.findAll({ where: { user_id: userId } });
    res.json(complaints);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create a chat message for a complaint
const createChat = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { complaint_id, text } = req.body;
  if (!complaint_id || !text) {
    return res
      .status(400)
      .json({ error: "complaint_id and text are required" });
  }
  try {
    // Optionally, check if complaint exists and belongs to user
    const complaint = await Complaint.findByPk(complaint_id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    const chat = await ComplaintChat.create({
      complaint_id,
      user_id: userId,
      text,
    });
    res.status(201).json(chat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  list,
  view,
  create,
  createChat,
};
