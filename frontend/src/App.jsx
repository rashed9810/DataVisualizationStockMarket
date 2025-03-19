import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Tabs, Tab, Container, Alert, Spinner } from "react-bootstrap";
import DataTable from "./components/DataTable";
import StockCharts from "./components/StockCharts";
import TradeCodeSelector from "./components/TradeCodeSelector";
import AddStockForm from "./components/AddStockForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tradeCodes, setTradeCodes] = useState([]);
  const [selectedTradeCode, setSelectedTradeCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("json"); 

  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/data?source=${dataSource}`);
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
      const response = await axios.get("/api/trade_codes");
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
      await axios.put(`/api/data/${updatedItem.id}`, updatedItem);
      setData(
        data.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
    } catch (err) {
      console.error("Error updating item:", err);
      alert("Failed to update item. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`/api/data/${id}`);
        setData(data.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Error deleting item:", err);
        alert("Failed to delete item. Please try again.");
      }
    }
  };

  const handleCreate = async (newItem) => {
    try {
      const response = await axios.post("/api/data", newItem);
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
            <span>Data Source:</span>
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

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" role="status" variant="primary" />
            <span>Loading data...</span>
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
                  onDelete={handleDelete}
                />
              </Tab>
              <Tab eventKey="add" title="Add New Data">
                <AddStockForm onCreate={handleCreate} tradeCodes={tradeCodes} />
              </Tab>
            </Tabs>
          </>
        )}
      </Container>
    </div>
  );
}

export default App;
