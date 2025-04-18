import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

const AddStockForm = ({ onCreate, tradeCodes }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    trade_code: tradeCodes[0] || "",
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    volume: 0,
  });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Helper functions for safe type conversion
  const safeParseFloat = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    try {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      console.error("Error parsing float:", e, value);
      return 0;
    }
  };

  const safeParseInt = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    try {
      // Handle string values with commas
      if (typeof value === "string" && value.includes(",")) {
        value = value.replace(/,/g, "");
      }
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      console.error("Error parsing int:", e, value);
      return 0;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (["open", "high", "low", "close"].includes(name)) {
      parsedValue = safeParseFloat(value);
    } else if (name === "volume") {
      parsedValue = safeParseInt(value);
    }

    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Ensure all numeric values are properly typed before validation
    const validatedData = {
      ...formData,
      open: safeParseFloat(formData.open),
      high: safeParseFloat(formData.high),
      low: safeParseFloat(formData.low),
      close: safeParseFloat(formData.close),
      volume: safeParseInt(formData.volume),
    };

    // Update form data with validated values
    setFormData(validatedData);

    // Validate price relationships
    if (validatedData.high < validatedData.open) {
      setError("High price must be greater than or equal to Open price");
      return;
    }

    if (validatedData.open < validatedData.low) {
      setError("Open price must be greater than or equal to Low price");
      return;
    }

    if (validatedData.high < validatedData.low) {
      setError("High price must be greater than Low price");
      return;
    }

    try {
      onCreate(formData);
      setSuccess(true);
      setError("");

      setFormData({
        date: new Date().toISOString().split("T")[0],
        trade_code: tradeCodes[0] || "",
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
      });

      setValidated(false);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Failed to create new stock data. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h3 className="mb-4">Add New Stock Data</h3>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && (
        <Alert variant="success">Stock data added successfully!</Alert>
      )}

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide a valid date.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Trade Code</Form.Label>
          <Form.Select
            name="trade_code"
            value={formData.trade_code}
            onChange={handleChange}
            required
          >
            {tradeCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Open Price</Form.Label>
          <Form.Control
            type="number"
            step="0"
            name="open"
            value={formData.open}
            onChange={handleChange}
            required
            min="0"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>High Price</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            name="high"
            value={formData.high}
            onChange={handleChange}
            required
            min="0"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Low Price</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            name="low"
            value={formData.low}
            onChange={handleChange}
            required
            min="0"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Close Price</Form.Label>
          <Form.Control
            type="number"
            step="0.01"
            name="close"
            value={formData.close}
            onChange={handleChange}
            required
            min="0"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Volume</Form.Label>
          <Form.Control
            type="number"
            name="volume"
            value={formData.volume}
            onChange={handleChange}
            required
            min="0"
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Add Stock Data
        </Button>
      </Form>
    </div>
  );
};

export default AddStockForm;
