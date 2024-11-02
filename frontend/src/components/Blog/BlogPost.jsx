import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

const BlogPost = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const fetchBlogData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(response.data);
        const userId = localStorage.getItem('userId');
        setHasLiked(response.data.likedBy.includes(userId));
        
        // Fetch comments
        const commentsResponse = await axios.get(`http://localhost:5000/api/blogs/${id}/comments`);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/api/blogs/${id}/comments`, {
        content: newComment,
        author: localStorage.getItem('userId'),
      });
      setComments([...comments, response.data]); // Add new comment to local state
      setNewComment(''); // Clear the input
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment.');
    }
  };

  const handleLikeToggle = async () => {
    const token = localStorage.getItem('token');

    if (!isLoggedIn) {
      setPopupMessage('Please log in to like the blog post.');
      setIsPopupVisible(true);
      setTimeout(() => {
        setIsPopupVisible(false);
      }, 3000);
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/blogs/${id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBlog(response.data);
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Failed to toggle like.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!blog) return <div className="loading">Blog not found.</div>;

  return (
    <div className="blog-post">
      <h1>{blog.title}</h1>
      <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
      <button className="like-button" onClick={handleLikeToggle}>
        <FontAwesomeIcon icon={hasLiked ? faThumbsDown : faThumbsUp} />
        {/* {hasLiked ? ' Unlike' : ' Like'} */}
      </button>
      <span className="like-count">{blog.likes} {blog.likes === 1 ? 'like' : 'likes'}</span>
      {isPopupVisible && <div className="popup">{popupMessage}</div>}
      <h3>Comments</h3>
      <form onSubmit={handleCommentSubmit} className="comments">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          required
        />
        <button type="submit">Comment</button>
      </form>
      <div className="comments">
        {comments.map((comment) => (
          <div key={comment._id} className="comment">
            <strong>{comment.author.username}:</strong> {comment.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPost;
