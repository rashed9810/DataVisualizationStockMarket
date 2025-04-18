import React, { useState, useEffect } from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";
import { FaTrash, FaExclamationTriangle, FaSync } from "react-icons/fa";
import "animate.css/animate.min.css";

const DeleteConfirmationModal = ({ show, onHide, onConfirm, itemId }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Clear error when modal is reopened
  useEffect(() => {
    if (show) {
      setError(null);
    }
  }, [show]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm(itemId);
      onHide();
    } catch (err) {
      setError(err.message || "Failed to delete item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      className="delete-confirmation-modal"
    >
      <div className="modal-content-wrapper animate__animated animate__fadeInUp animate__faster">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger">
            <FaExclamationTriangle className="me-2" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 pb-4">
          <div className="text-center mb-4">
            <div className="delete-icon-container mb-3">
              <FaTrash className="delete-icon" />
            </div>
            <h5>Are you sure you want to delete this item?</h5>
            <p className="text-muted">
              This action cannot be undone. The data will be permanently removed
              from the database.
            </p>
          </div>

          {error && (
            <Alert
              variant="danger"
              className="mb-0 animate__animated animate__fadeIn"
            >
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 d-flex justify-content-center">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            className="cancel-btn"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {error ? (
            <Button
              variant="warning"
              onClick={handleDelete}
              className="retry-btn"
              disabled={isDeleting}
            >
              <FaSync className="me-2" />
              Retry
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={handleDelete}
              className="confirm-delete-btn"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="me-2" />
                  Delete
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
