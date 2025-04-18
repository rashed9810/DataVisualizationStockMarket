import React, { useState } from "react";
import { Table, Button, Form, InputGroup, Pagination } from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

const DataTable = ({ data, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "asc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleEditClick = (item) => {
    // Safely parse numeric values
    const safeParseFloat = (value) => {
      if (value === null || value === undefined) return 0;
      try {
        return typeof value === "number" ? value : parseFloat(value);
      } catch (e) {
        console.error("Error parsing float:", e, value);
        return 0;
      }
    };

    const safeParseInt = (value) => {
      if (value === null || value === undefined) return 0;
      try {
        // Handle string values with commas
        if (typeof value === "string" && value.includes(",")) {
          value = value.replace(/,/g, "");
        }
        return typeof value === "number" ? value : parseInt(value, 10);
      } catch (e) {
        console.error("Error parsing int:", e, value);
        return 0;
      }
    };

    const editItem = {
      ...item,
      open: safeParseFloat(item.open),
      high: safeParseFloat(item.high),
      low: safeParseFloat(item.low),
      close: safeParseFloat(item.close),
      volume: safeParseInt(item.volume),
    };

    setEditingId(item.id);
    setEditFormData(editItem);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    if (name === "volume") {
      parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) parsedValue = 0;
    } else if (["open", "high", "low", "close"].includes(name)) {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setEditFormData({ ...editFormData, [name]: parsedValue });
  };

  const handleSaveClick = async () => {
    try {
      // Validate the data before saving
      if (editFormData.high < editFormData.low) {
        alert("High price cannot be less than low price");
        return;
      }

      // Show loading state
      setIsSaving(true);

      // Call the onEdit function and wait for it to complete
      const success = await onEdit(editFormData);

      // Only clear editing state if save was successful
      if (success) {
        setEditingId(null);
      }

      // Always reset saving state
      setIsSaving(false);
    } catch (error) {
      console.error("Error in handleSaveClick:", error);
      // Reset saving state
      setIsSaving(false);
    }
  };

  const handleCancelClick = () => {
    // Simply clear the editing state
    setEditingId(null);
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined) return "N/A";
    let num;
    try {
      num = typeof value === "number" ? value : parseFloat(value);
      return isNaN(num) ? "N/A" : num.toFixed(decimals);
    } catch (error) {
      console.error("Error formatting number:", error, value);
      return "N/A";
    }
  };

  const formatLargeNumber = (value) => {
    if (value === null || value === undefined) return "N/A";
    let num;
    try {
      // Handle string values with commas
      if (typeof value === "string" && value.includes(",")) {
        value = value.replace(/,/g, "");
      }
      num = typeof value === "number" ? value : parseInt(value, 10);
      return isNaN(num) ? "N/A" : num.toLocaleString();
    } catch (error) {
      console.error("Error formatting large number:", error, value);
      return "N/A";
    }
  };

  const filteredData = data.filter((item) => {
    return (
      item.trade_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (["open", "high", "low", "close", "volume"].includes(sortConfig.key)) {
      const aValue = parseFloat(a[sortConfig.key]);
      const bValue = parseFloat(b[sortConfig.key]);

      if (isNaN(aValue) && isNaN(bValue)) return 0;
      if (isNaN(aValue)) return sortConfig.direction === "asc" ? -1 : 1;
      if (isNaN(bValue)) return sortConfig.direction === "asc" ? 1 : -1;

      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="table-container">
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <Form.Group className="mb-0" style={{ width: "300px" }}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by trade code or date"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-0 d-flex align-items-center">
          <Form.Label className="me-2 mb-0">Rows:</Form.Label>
          <Form.Select
            style={{ width: "80px" }}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Form.Select>
        </Form.Group>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th
                onClick={() => requestSort("date")}
                style={{ cursor: "pointer" }}
              >
                Date {getSortIcon("date")}
              </th>
              <th
                onClick={() => requestSort("trade_code")}
                style={{ cursor: "pointer" }}
              >
                Trade Code {getSortIcon("trade_code")}
              </th>
              <th
                onClick={() => requestSort("open")}
                style={{ cursor: "pointer" }}
              >
                Open {getSortIcon("open")}
              </th>
              <th
                onClick={() => requestSort("high")}
                style={{ cursor: "pointer" }}
              >
                High {getSortIcon("high")}
              </th>
              <th
                onClick={() => requestSort("low")}
                style={{ cursor: "pointer" }}
              >
                Low {getSortIcon("low")}
              </th>
              <th
                onClick={() => requestSort("close")}
                style={{ cursor: "pointer" }}
              >
                Close {getSortIcon("close")}
              </th>
              <th
                onClick={() => requestSort("volume")}
                style={{ cursor: "pointer" }}
              >
                Volume {getSortIcon("volume")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id}>
                <td>{item.date}</td>
                <td>{item.trade_code}</td>
                <td>
                  {editingId === item.id ? (
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="open"
                      value={editFormData.open}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    formatNumber(item.open)
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="high"
                      value={editFormData.high}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    formatNumber(item.high)
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="low"
                      value={editFormData.low}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    formatNumber(item.low)
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="close"
                      value={editFormData.close}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    formatNumber(item.close)
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <Form.Control
                      type="number"
                      name="volume"
                      value={editFormData.volume}
                      onChange={handleEditFormChange}
                    />
                  ) : (
                    formatLargeNumber(item.volume)
                  )}
                </td>
                <td>
                  {editingId === item.id ? (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleSaveClick}
                        className="me-2 save-edit-btn"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>{" "}
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave /> Save
                          </>
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCancelClick}
                        className="cancel-edit-btn"
                      >
                        <FaTimes /> Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEditClick(item)}
                        className="me-2"
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>
          <Pagination>
            <Pagination.First
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }

              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === currentPage}
                  onClick={() => paginate(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}

            <Pagination.Next
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default DataTable;
