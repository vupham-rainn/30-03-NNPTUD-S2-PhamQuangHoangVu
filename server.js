const express = require('express');
const mongoose = require('mongoose');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// Middleware để đọc dữ liệu JSON từ request body
app.use(express.json());

// Kết nối MongoDB (Đảm bảo bạn đã cài và chạy MongoDB trên máy hoặc dùng MongoDB Atlas)
mongoose.connect('mongodb://localhost:27017/chat-app')
  .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// --- GIẢ LẬP MIDDLEWARE ĐĂNG NHẬP (Fake Auth) ---
// Trong thực tế, bạn sẽ dùng JWT để verify và lấy _id. Ở đây ta gán cứng để test.
app.use((req, res, next) => {
  req.user = {
    // Giả sử đây là ID của bạn (User A)
    _id: '64b5f8c8e4b0a1b2c3d4e5f6' 
  };
  next();
});
// ------------------------------------------------

// Đăng ký routes
app.use('/messages', messageRoutes);

// Khởi động server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});