import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [links, setLinks] = useState([{ text: '', url: '' }]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to check if user is logged in

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    setLinks(updatedLinks);
  };

  const handleAddLink = () => {
    setLinks([...links, { text: '', url: '' }]);
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setPopupMessage('Please log in to create a blog post.');
      setIsPopupVisible(true);
      setTimeout(() => {
        setIsPopupVisible(false);
      }, 3000);
      return;
    }

    let formattedContent = content;
    links.forEach(link => {
      if (link.text && link.url) {
        const anchorTag = `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a>`;
        formattedContent = formattedContent.replace(link.text, anchorTag);
      }
    });

    try {
      const token = localStorage.getItem('token'); 
      await axios.post('http://localhost:5000/api/blogs', { title, content: formattedContent }, {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      });
      setPopupMessage('Blog created successfully!');
      setIsPopupVisible(true);
      setTitle('');
      setContent('');
      setLinks([{ text: '', url: '' }]);

      setTimeout(() => {
        setIsPopupVisible(false);
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create blog. Please try again.';
      console.error('Error creating blog:', error);
      setPopupMessage(errorMessage);
      setIsPopupVisible(true);

      setTimeout(() => {
        setIsPopupVisible(false);
      }, 3000);
    }
  };

  return (
    <div className="create-blog">
      <h1>Create a New Blog</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          style={{ height: '200px' }}
          required
        />
        <h3>Add Links:</h3>
        {links.map((link, index) => (
          <div key={index} className="link-inputs">
            <input
              type="text"
              value={link.text}
              onChange={(e) => handleLinkChange(index, 'text', e.target.value)}
              placeholder="Text to hyperlink"
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
              placeholder="URL"
            />
            <button type="button" onClick={() => handleRemoveLink(index)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={handleAddLink}>Add More Links</button>
        <button type="submit">Create Blog</button>
      </form>
      {isPopupVisible && (
        <div className="popup">
          {popupMessage}
        </div>
      )}
    </div>
  );
};

export default CreateBlog;
