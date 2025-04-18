import React, { useState, useEffect, useCallback } from "react";
import api from "./api";
import { Tabs, Tab, Container, Alert, Spinner } from "react-bootstrap";
import DataTable from "./components/DataTable";
import StockCharts from "./components/StockCharts";
import TradeCodeSelector from "./components/TradeCodeSelector";
import AddStockForm from "./components/AddStockForm";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import Notification from "./components/Notification";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css/animate.min.css";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tradeCodes, setTradeCodes] = useState([]);
  const [selectedTradeCode, setSelectedTradeCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("json");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/data?source=${dataSource}`);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  const fetchTradeCodes = useCallback(async () => {
    try {
      const response = await api.get("/api/trade_codes");
      setTradeCodes(response.data);
      if (response.data.length > 0 && !selectedTradeCode) {
        setSelectedTradeCode(response.data[0]);
      }
    } catch (err) {
      console.error("Error fetching trade codes:", err);
    }
  }, [selectedTradeCode]);

  useEffect(() => {
    fetchData();
    fetchTradeCodes();
  }, [fetchData, fetchTradeCodes]);

  useEffect(() => {
    if (selectedTradeCode) {
      setFilteredData(
        data.filter((item) => item.trade_code === selectedTradeCode)
      );
    } else {
      setFilteredData(data);
    }
  }, [selectedTradeCode, data]);

  const handleEdit = async (updatedItem) => {
    try {
      console.log("Updating item:", updatedItem);
      const response = await api.put(
        `/api/data/${updatedItem.id}`,
        updatedItem
      );

      if (response.status === 200) {
        // Update the data in state
        setData(
          data.map((item) =>
            item.id === updatedItem.id ? response.data : item
          )
        );

        // Show success notification
        setNotification({
          show: true,
          message: "Item updated successfully",
          type: "success",
        });

        return true;
      } else {
        throw new Error(response.data?.error || "Failed to update item");
      }
    } catch (err) {
      console.error("Error updating item:", err);

      // Show error notification instead of alert
      setNotification({
        show: true,
        message:
          err.response?.data?.error ||
          err.message ||
          "Failed to update item. Please try again.",
        type: "danger",
      });

      return false;
    }
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      // First check if the item exists in our data
      const itemExists = data.some((item) => item.id === id);
      if (!itemExists) {
        throw new Error("Item not found in the current dataset");
      }

      const response = await api.delete(`/api/data/${id}`);
      if (response.status === 200) {
        setData(data.filter((item) => item.id !== id));
        setNotification({
          show: true,
          message: "Item deleted successfully",
          type: "success",
        });
        return true;
      } else {
        throw new Error(response.data?.error || "Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      // Check if it's a network error
      if (err.message === "Network Error") {
        throw new Error("Network Error: Cannot connect to the server");
      } else {
        throw new Error(
          err.response?.data?.error ||
            err.message ||
            "Failed to delete item. Please try again."
        );
      }
    }
  };

  const handleCreate = async (newItem) => {
    try {
      const response = await api.post("/api/data", newItem);
      const createdItem = { id: response.data.id, ...newItem };
      setData([...data, createdItem]);
    } catch (err) {
      console.error("Error creating item:", err);
      alert("Failed to create item. Please try again.");
    }
  };

  const toggleDataSource = () => {
    setDataSource((prev) => (prev === "json" ? "sql" : "json"));
  };

  return (
    <div className="App">
      <Container>
        <div className="header-section">
          <h1 className="main-title">Stock Market Data Visualization</h1>
          <div className="data-source-toggle">
            <span className="data-source-label">
              <strong>Data Source:</strong>
            </span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="dataSourceToggle"
                checked={dataSource === "sql"}
                onChange={toggleDataSource}
              />
              <label htmlFor="dataSourceToggle">
                <span className={dataSource === "json" ? "active" : ""}>
                  JSON
                </span>
                <span className={dataSource === "sql" ? "active" : ""}>
                  SQL
                </span>
              </label>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="animate__animated animate__fadeIn">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="loading-container">
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              style={{ width: "3rem", height: "3rem" }}
            />
            <span className="loading-text">Loading data...</span>
          </div>
        ) : (
          <>
            <TradeCodeSelector
              tradeCodes={tradeCodes}
              selectedTradeCode={selectedTradeCode}
              onSelect={setSelectedTradeCode}
            />

            <Tabs defaultActiveKey="charts" id="main-tabs" className="mb-4">
              <Tab eventKey="charts" title="Charts">
                <StockCharts data={filteredData} />
              </Tab>
              <Tab eventKey="table" title="Data Table">
                <DataTable
                  data={filteredData}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              </Tab>
              <Tab eventKey="add" title="Add New Data">
                <AddStockForm onCreate={handleCreate} tradeCodes={tradeCodes} />
              </Tab>
            </Tabs>
          </>
        )}
      </Container>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        itemId={itemToDelete}
      />

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  );
}

export default App;
