require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json());

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, default: null },
  isAnonymous: { type: Boolean, default: false },
});
const User = mongoose.model('User', userSchema);

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
}, { timestamps: true });
const Blog = mongoose.model('Blog', blogSchema);

const commentSchema = new mongoose.Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
const Comment = mongoose.model('Comment', commentSchema);

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.sendStatus(403);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

app.post('/api/blogs/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;

    const newComment = new Comment({
      blog: id,
      content,
      author,
    });
    await newComment.save();
    await Blog.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

app.get('/api/blogs/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.id }).populate('author', 'username');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

app.post('/api/blogs/:id/like', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const index = blog.likedBy.indexOf(userId);
    if (index === -1) {
      blog.likedBy.push(userId);
      blog.likes += 1;
    } else {
      blog.likedBy.splice(index, 1);
      blog.likes -= 1;
    }
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '10h' });
    const expiry = Date.now() + 36000000;

    res.json({ token, userId: user._id, expiry });
  } catch (error) {
    res.status(400).json({ message: 'Error logging in', error: error.message });
  }
});

app.post('/api/refresh', authenticateJWT, (req, res) => {
  const userId = req.user.userId;

  try {
    const newToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    const newExpiry = Date.now() + 3600000;

    res.json({ token: newToken, expiry: newExpiry });
  } catch (error) {
    res.status(500).json({ message: 'Error refreshing token', error: error.message });
  }
});

app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/profile', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

app.put('/api/profile', authenticateJWT, async (req, res) => {
  const { email, isAnonymous } = req.body;
  const userId = req.user.userId;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email, isAnonymous },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(400).json({ message: 'Error updating profile', error: error.message });
  }
});

app.post('/api/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    res.json({ exists: !!existingUser });
  } catch (error) {
    res.status(500).json({ message: 'Error checking email duplication' });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate('author', 'username isAnonymous');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog', error: error.message });
  }
});

app.post('/api/blogs', authenticateJWT, async (req, res) => {
  const { title, content } = req.body;
  const newBlog = new Blog({ title, content, author: req.user.userId });

  try {
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(400).json({ message: 'Error creating blog', error: error.message });
  }
});

app.put('/api/blogs/:id', authenticateJWT, async (req, res) => {
  const { title, content } = req.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true, runValidators: true }
    );
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: 'Error updating blog', error: error.message });
  }
});

app.delete('/api/blogs/:id', authenticateJWT, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    if (blog.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this blog' });
    }

    await Comment.deleteMany({ blog: req.params.id });

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
