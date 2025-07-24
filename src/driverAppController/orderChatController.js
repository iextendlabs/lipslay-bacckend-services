const { OrderChat, User, ModelHasRoles, Role } = require('../models');

// Get all chats for an order
const getOrderChats = async (req, res) => {
  try {
    const { order_id } = req.params;
    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required.' });
    }
    const chats = await OrderChat.findAll({
      where: { order_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: ModelHasRoles,
              as: 'modelHasRoles',
              include: [
                {
                  model: Role,
                  as: 'role',
                  attributes: ['name']
                }
              ]
            }
          ]
        }
      ],
      order: [['created_at', 'ASC']]
    });
    if (!chats || chats.length === 0) {
      return res.status(404).json({ error: 'No chats found for this order.' });
    }
    // Map chats to required format
    const mappedChats = chats.map(chat => {
      let userType = 'User';
      const roles = chat.user?.modelHasRoles || [];
      if (roles.length > 0 && roles[0].role?.name) {
        const roleName = roles[0].role.name;
        if (roleName === 'Admin') userType = 'Admin';
        else if (roleName === 'Staff') userType = 'Staff';
        else if (roleName === 'Driver') userType = 'self';
      }
      return {
        text: chat.text,
        created_at: chat.created_at,
        user: userType,
        location: chat.type == "Location" ? true : false,
      };
    });
    res.json(mappedChats);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
};

// Add a new chat to an order
const createOrderChat = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { user_id, text, type } = req.body;
    if (!order_id || !user_id || !text) {
      return res.status(400).json({ error: 'order_id, user_id, and text are required.' });
    }
    const chat = await OrderChat.create({
      order_id,
      user_id,
      text,
      type: typeof type !== 'undefined' ? type : null
    });
    if (!chat) {
      return res.status(500).json({ error: 'Failed to create chat.' });
    }
    res.status(201).json({ success: true, message: 'Chat created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
};

module.exports = { getOrderChats, createOrderChat };
