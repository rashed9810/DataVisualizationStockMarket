import React from "react";
import { Form } from "react-bootstrap";

const TradeCodeSelector = ({ tradeCodes, selectedTradeCode, onSelect }) => {
  return (
    <div className="trade-code-selector">
      <Form.Group>
        <Form.Label>Select Trade Code:</Form.Label>
        <Form.Select
          value={selectedTradeCode}
          onChange={(e) => onSelect(e.target.value)}
        >
          {tradeCodes.map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>
  );
};

export default TradeCodeSelector;
