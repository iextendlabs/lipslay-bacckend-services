const { OrderChat, User, ModelHasRoles, Role } = require('../models');

// Get all chats for an order
const getOrderChats = async (req, res) => {
  try {
    const { order_id } = req.params;
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
        type: chat.type
      };
    });
    res.json(mappedChats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new chat to an order
const createOrderChat = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { user_id, text, type } = req.body;
    const chat = await OrderChat.create({
      order_id,
      user_id,
      text,
      type,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({ success: true, message: 'Chat created successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getOrderChats, createOrderChat };
