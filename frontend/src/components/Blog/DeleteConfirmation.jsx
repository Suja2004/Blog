import React from 'react';
import './DeleteConfirmation.css'; // Import CSS for styling

const DeleteConfirmation = ({ isVisible, onClose, onConfirm }) => {
  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this blog?</p>
        <div className="modal-actions">
          <button className="confirm-btn" onClick={onConfirm}>Yes, Delete</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
