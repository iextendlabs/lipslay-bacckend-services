const {
  Quote,
  Bid,
  BidChat,
  Staff,
  QuoteStaff,
  Transaction,
  User,
  BidImage,
  Affiliate, // Add BidImage model
} = require("../models");
const urls = require("../config/urls");

// List all bids for a quote
const listBidsForQuote = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  const quoteId = req.params.quoteId || req.params.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  try {
    // Only allow if the quote belongs to the user
    const quote = await Quote.findOne({
      where: { id: quoteId, user_id: userId },
    });
    if (!quote) {
      return res
        .status(404)
        .json({ success: false, error: "Quote not found or not yours" });
    }
    const bids = await Bid.findAll({
      where: { quote_id: quoteId },
      include: [
        {
          model: Staff,
          as: "staffProfile",
          attributes: ["user_id"],
          include: [{ model: User, attributes: ["id", "name"] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    const data = bids.map((bid) => ({
      id: bid.id,
      staff:
        bid.staffProfile && bid.staffProfile.User
          ? bid.staffProfile.User.name
          : null,
      bid_amount: bid.bid_amount,
      comment: bid.comment,
      status: bid.status,
      show_confirm_button: quote.bid_id == null,
      show_chat_button: quote.bid_id == null || quote.bid_id === bid.id,
      is_selected: quote.bid_id === bid.id,
    }));
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Confirm a bid for a quote
const confirmBid = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  const quoteId = req.params.quoteId || req.params.id;
  const { bid_id } = req.body;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  if (!bid_id) {
    return res
      .status(400)
      .json({ success: false, error: "bid_id is required" });
  }
  try {
    const quote = await Quote.findOne({
      where: { id: quoteId, user_id: userId },
      include: [{ model: Affiliate, as: "affiliate" }],
    });
    if (!quote) {
      return res
        .status(404)
        .json({ success: false, error: "Quote not found or not yours" });
    }
    const bid = await Bid.findOne({ where: { id: bid_id, quote_id: quoteId } });
    if (!bid) {
      return res
        .status(404)
        .json({ success: false, error: "Bid not found for this quote" });
    }
    quote.bid_id = bid_id;
    quote.status = "Complete";
    await quote.save();

    const staffUser = await User.findByPk(bid.staff_id);
    if (staffUser) {
      await staffUser.notifyOnMobile(
        `Bid Chat on quote#${bid.quote_id}`,
        "Congratulations! Your bid has been accepted by the customer.",
        null,
        "Staff App"
      );
    }

    const staffQuote = await QuoteStaff.findOne({
      where: { quote_id: quoteId, staff_id: bid.staff_id },
    });
    let commission = 0;
    if (staffQuote && staffQuote.quote_commission) {
      commission =
        (Number(bid.bid_amount) * Number(staffQuote.quote_commission)) / 100;
      if (commission) {
        await Transaction.create({
          user_id: bid.staff_id,
          amount: -commission,
          type: "Quote",
          status: "Approved",
          description: `Quote commission for quote ID: ${quote.id}`,
          created_at: new Date(),
          updated_at: new Date(),
        });

        if (quote.affiliate_id) {
          const affiliate = quote.affiliate;
          if (affiliate && affiliate.commission && affiliate.commission > 0) {
            const affiliateCommission = commission * affiliate.commission / 100;
            if (affiliateCommission) {
              await Transaction.create({
                user_id: affiliate.user_id,
                amount: affiliateCommission,
                type: "Quote",
                status: "Approved",
                description: `Affiliate commission for quote ID: ${quote.id}`,
                created_at: new Date(),
                updated_at: new Date(),
              });
            }
          }
        }
      }
    }

    return res.json({
      success: true,
      message: "Bid confirmed for quote",
      bid_id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get bid and its chat messages
const getBidWithChats = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  const bidId = req.params.bidId || req.params.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  try {
    // Find the bid and include staff, chat messages, and images
    const bid = await Bid.findOne({
      where: { id: bidId },
      include: [
        {
          model: BidChat,
          as: "chats",
          attributes: [
            "id",
            "message",
            "created_at",
            "sender_id",
            "file",
            "location",
          ],
          order: [["created_at", "ASC"]],
        },
        {
          model: BidImage,
          as: "images",
          attributes: ["id", "image", "created_at"],
        },
      ],
    });
    if (!bid) {
      return res.status(404).json({ success: false, error: "Bid not found" });
    }
    // Format response
    const bidData = {
      id: bid.id,
      bid_amount: bid.bid_amount,
      comment: bid.comment,
      status: bid.status,
      images: (bid.images || []).map(
        (img) => `${urls.baseUrl}${urls.quoteBidImages}${img.image}`
      ),
    };
    const chatData = (bid.chats || []).map((chat) => {
      let type = "text";
      let value = chat.message;
      let link = null;
      if (chat.location == 1) {
        type = "location";
        // Expecting message as "lat,lng"
        const [lat, lng] = (chat.message || "").split(",");
        if (lat && lng) {
          link = `https://maps.google.com/?q=${lat},${lng}`;
        }
      } else if (chat.file == 1) {
        type = "file";
        // message is the filename, construct image link
        link = `${urls.baseUrl}${urls.quoteBidChatImages}${chat.message}`;
      }
      return {
        id: chat.id,
        type,
        value,
        link,
        created_at: chat.created_at,
        sender: chat.sender_id == userId ? true : false,
      };
    });
    return res.json({ success: true, bid: bidData, chats: chatData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Create a new chat message for a bid
const createBidChat = async (req, res) => {
  const userId = req.user && (req.user.userId || req.user.id);
  const bidId = req.params.bidId || req.params.id || req.body.bid_id;
  let message = req.body.message;
  let file = req.body.file || 0;
  if (req.file) {
    message = req.file.filename;
    file = 1;
  }
  const { location = 0 } = req.body;
  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  if (!bidId || !message) {
    return res
      .status(400)
      .json({ success: false, error: "bid_id and message are required" });
  }
  try {
    // Check if bid exists
    const bid = await Bid.findOne({ where: { id: bidId } });
    if (!bid) {
      return res.status(404).json({ success: false, error: "Bid not found" });
    }

    // Create chat
    const chat = await BidChat.create({
      bid_id: bidId,
      sender_id: userId,
      message,
      file: !!file,
      location: !!location,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send notification to staff user
    if (bid && bid.staff_id) {
      const staffUser = await User.findByPk(bid.staff_id);
      if (staffUser) {
        const notifyMessage = chat.file
          ? "There is a file uploaded"
          : chat.message;
        await staffUser.notifyOnMobile(
          `Bid Chat on quote#${bid.quote_id}`,
          notifyMessage,
          null,
          "Staff App"
        );
      }
    }

    return res.json({
      success: true,
      message: "Chat message sent",
      chat_id: chat.id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  listBidsForQuote,
  confirmBid,
  getBidWithChats,
  createBidChat,
};
