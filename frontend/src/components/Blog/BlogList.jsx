import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DeleteConfirmation from './DeleteConfirmation';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem('userId'); 

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('https://blog-backend-oy0s.onrender.com/api/blogs');
        const sortedBlogs = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setBlogs(sortedBlogs);
      } catch (error) {
        setError('Server Down.');
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
  
    if (blogToDelete) {
      try {
        await axios.delete(`https://blog-backend-oy0s.onrender.com/api/blogs/${blogToDelete}`, {
          headers: {
            Authorization: `Bearer ${token}` 
          }
        });
        setBlogs(blogs.filter(blog => blog._id !== blogToDelete));
        setBlogToDelete(null);
      } catch (error) {
        setError('Error deleting blog. Please try again later.');
        console.error('Error deleting blog:', error);
      }
      setIsModalVisible(false);
    }
  };
  

  return (
    <div className="blog-list">
      <h1>Blog Posts</h1>
      {loading ? (
        <p className="loading">Loading blogs...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : blogs.length === 0 ? (
        <p>It’s a blank slate! Create your first blog and inspire others.</p>
      ) : (
        <div className="card-list">
          {blogs.map((blog) => (
            <div className="card" key={blog._id}>
              <div className="card-header" onClick={() => navigate(`/blogs/${blog._id}`)}>
                <h2>{blog.title}</h2>
                <p className="author-name">
                  {blog.author.isAnonymous ? 'Anonymous' : blog.author.username}
                </p>
                <p>{stripHtml(blog.content).substring(0, 200)}...</p>
                <p className="date">{new Date(blog.createdAt).toLocaleString()}</p>
              </div>
              <div className="card-actions">
                {blog.author._id === currentUserId && ( 
                  <>
                    <button className='edit-btn' onClick={() => navigate(`/edit/${blog._id}`)}>Edit</button>
                    <button className='del-btn' onClick={() => {
                      setIsModalVisible(true);
                      setBlogToDelete(blog._id);
                    }}>Delete</button>
                  </>
                )}
              </div>
              <div className="blog-stats">
                <p className="likes">{blog.likes} Likes</p>
                <p className="comments">{blog.commentCount} Comments</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <DeleteConfirmation
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BlogList;
