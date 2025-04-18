import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Overlay, Popover } from "react-bootstrap";
import { FaSearch, FaChevronDown, FaCheck, FaTimes } from "react-icons/fa";

const TradeCodeSelector = ({ tradeCodes, selectedTradeCode, onSelect }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const target = useRef(null);

  const filteredCodes = tradeCodes.filter((code) =>
    code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (target.current && !target.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="trade-code-selector animate__animated animate__fadeIn">
      <Form.Group>
        <Form.Label className="selector-label">
          <FaSearch className="me-2" /> Select Trade Code:
        </Form.Label>

        <div ref={target}>
          <Button
            variant="light"
            className="custom-dropdown-toggle w-100"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="d-flex justify-content-between align-items-center">
              <span>{selectedTradeCode || "All Trade Codes"}</span>
              <FaChevronDown />
            </div>
          </Button>

          <Overlay
            show={showDropdown}
            target={target.current}
            placement="bottom-start"
            container={document.body}
            rootClose={true}
            onHide={() => setShowDropdown(false)}
          >
            <Popover id="popover-contained" className="custom-dropdown-menu">
              <Popover.Body className="p-0">
                <div className="dropdown-search">
                  <div className="search-input-container">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search codes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                    {searchTerm && (
                      <FaTimes
                        className="clear-search"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchTerm("");
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="dropdown-items-container">
                  <div
                    className={`dropdown-item ${
                      !selectedTradeCode ? "active" : ""
                    }`}
                    onClick={() => {
                      onSelect("");
                      setShowDropdown(false);
                      setSearchTerm("");
                    }}
                  >
                    <span>All Trade Codes</span>
                    {!selectedTradeCode && <FaCheck className="ms-2" />}
                  </div>
                  {filteredCodes.map((code) => (
                    <div
                      key={code}
                      className={`dropdown-item ${
                        selectedTradeCode === code ? "active" : ""
                      }`}
                      onClick={() => {
                        onSelect(code);
                        setShowDropdown(false);
                        setSearchTerm("");
                      }}
                    >
                      <span>{code}</span>
                      {selectedTradeCode === code && (
                        <FaCheck className="ms-2" />
                      )}
                    </div>
                  ))}
                </div>
              </Popover.Body>
            </Popover>
          </Overlay>
        </div>

        {selectedTradeCode && (
          <div className="selected-code-info mt-2 animate__animated animate__fadeIn">
            <span className="viewing-text">Currently viewing:</span>
            <span className="selected-code-badge">{selectedTradeCode}</span>
          </div>
        )}
      </Form.Group>
    </div>
  );
};

export default TradeCodeSelector;
