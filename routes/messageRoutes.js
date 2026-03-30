const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');

// 1. GET /:userID - Lấy toàn bộ tin nhắn với 1 user
router.get('/:userID', async (req, res) => {
  try {
    const currentUserId = req.user._id; 
    const targetUserId = req.params.userID;

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: targetUserId },
        { from: targetUserId, to: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. POST / - Gửi tin nhắn mới
router.post('/', async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { to, type, content } = req.body;

    if (!to || !type || !content) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    const newMessage = new Message({
      from: currentUserId,
      to: to,
      contentMessage: { type, content }
    });

    await newMessage.save();
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. GET / - Lấy tin nhắn cuối cùng của mỗi đoạn chat
router.get('/', async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    const latestMessages = await Message.aggregate([
      { $match: { $or: [{ from: currentUserId }, { to: currentUserId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [ { $eq: ["$from", currentUserId] }, "$to", "$from" ]
          },
          lastMessage: { $first: "$$ROOT" }
        }
      }
    ]);

    res.status(200).json({ success: true, data: latestMessages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;