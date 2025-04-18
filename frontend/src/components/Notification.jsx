import React, { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import "animate.css/animate.min.css";

const Notification = ({
  show,
  message,
  type,
  onClose,
  autoHide = true,
  delay = 3000,
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="me-2 text-success" />;
      case "error":
        return <FaExclamationTriangle className="me-2 text-danger" />;
      default:
        return null;
    }
  };

  const getHeaderClass = () => {
    switch (type) {
      case "success":
        return "bg-success text-white";
      case "error":
        return "bg-danger text-white";
      default:
        return "bg-primary text-white";
    }
  };

  return (
    <ToastContainer position="top-end" className="p-3 position-fixed">
      <Toast
        show={visible}
        onClose={handleClose}
        delay={delay}
        autohide={autoHide}
        className="animate__animated animate__fadeInRight"
      >
        <Toast.Header className={getHeaderClass()}>
          {getIcon()}
          <strong className="me-auto">
            {type === "success" ? "Success" : "Error"}
          </strong>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={handleClose}
            aria-label="Close"
          ></button>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default Notification;
