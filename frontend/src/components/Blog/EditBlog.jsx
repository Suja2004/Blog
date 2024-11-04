import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditBlog = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [links, setLinks] = useState([{ text: '', url: '' }]); 
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`https://blog-backend-vert.vercel.app/api/blogs/${id}`);
        setTitle(response.data.title);
        setContent(response.data.content);

        const linkMatches = [...response.data.content.matchAll(/<a href="(.*?)">(.*?)<\/a>/g)];
        const existingLinks = linkMatches.map(match => ({
          text: match[2],
          url: match[1],
        }));
        
        setLinks(existingLinks.length ? existingLinks : [{ text: '', url: '' }]); 
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
    setLinks([...links, { text: '', url: '' }]);
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let formattedContent = content;
    const existingLinkUrls = new Set();
  
    const linkMatches = [...content.matchAll(/<a href="(.*?)">(.*?)<\/a>/g)];
    linkMatches.forEach(match => existingLinkUrls.add(match[1]));
  
    links.forEach(link => {
      if (link.text && link.url && !existingLinkUrls.has(link.url)) {
        formattedContent += ` <a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a>`;
      }
    });
  
    const token = localStorage.getItem('token');
    console.log("Submitting blog with token:", token); 
    console.log("Content to update:", formattedContent);
  
    try {
      await axios.put(`https://blog-backend-vert.vercel.app/api/blogs/${id}`, {
        title,
        content: formattedContent
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
  
      navigate(`/blogs/${id}`);
    } catch (error) {
      setError('Error updating blog. Please try again later.');
      console.error('Error updating blog:', error);
    }
  };
  

  const handleCancel = () => {
    navigate(`/blogs/${id}`); 
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
        <div className="link-container">
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
        </div>
        <button type="button" onClick={handleAddLink}>Add Another Link</button>

        <div className="button-container">
          <button type="submit">Update Blog</button>
          <button className='cancel-btn' type="button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;
