import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditBlog = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [links, setLinks] = useState([{ text: '', url: '' }]); // Initialize with one link
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setTitle(response.data.title);
        
        // Use stripHtml to remove HTML tags before setting content
        setContent(stripHtml(response.data.content));

        // Extract unique links from content
        const linkMatches = [...response.data.content.matchAll(/<a href="(.*?)">(.*?)<\/a>/g)];
        const existingLinks = Array.from(new Set(linkMatches.map(match => match[1]))).map(url => {
          const textMatch = linkMatches.find(match => match[1] === url);
          return { text: textMatch[2], url: url };
        });
        
        setLinks(existingLinks.length ? existingLinks : [{ text: '', url: '' }]); // Set links or initialize with an empty link
      } catch (error) {
        setError('Error fetching blog. Please try again later.');
        console.error('Error fetching blog:', error);
      }
    };
    fetchBlog();
  }, [id]);

  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    setLinks(updatedLinks);
  };

  const handleAddLink = () => {
    setLinks([...links, { text: '', url: '' }]); // Add a new empty link
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (links.some(link => !link.text || !link.url)) {
    //   setError('All links must have text and a URL.');
    //   return;
    // }

    // Create formatted content with hyperlinks
    let formattedContent = content;
    links.forEach(link => {
      if (link.text && link.url) {
        formattedContent += ` <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a>`;
      }
    });

    try {
      const token = localStorage.getItem('token'); // Retrieve token from local storage
    
      // Make a PUT request to update the blog
      await axios.put(`http://localhost:5000/api/blogs/${id}`, {
        title,
        content: formattedContent
      }, {
        headers: {
          Authorization: `Bearer ${token}` // Include the authorization header
        }
      });
    
      // Redirect to the updated blog post page
      navigate(`/blogs/${id}`);
    } catch (error) {
      setError('Error updating blog. Please try again later.');
      console.error('Error updating blog:', error);
    }
  };

  const handleCancel = () => {
    navigate(`/blogs/${id}`); // Redirect to the blog post
  };

  return (
    <div className="create-blog">
      <h1>Edit Blog</h1>
      {error && <p className="error">{error}</p>}

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
          required
        />
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
        <button type="button" onClick={handleAddLink}>Add Another Link</button>

        {/* Button container for side-by-side layout */}
        <div className="button-container">
          <button type="submit">Update Blog</button>
          <button className='cancel-btn' type="button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;
