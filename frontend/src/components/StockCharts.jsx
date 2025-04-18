import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Form,
  Row,
  Col,
  ButtonGroup,
  Button,
  Alert,
} from "react-bootstrap";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "recharts";

const StockCharts = ({ data }) => {
  const [chartType, setChartType] = useState("combined");
  const [dateRange, setDateRange] = useState("all");
  const [processedData, setProcessedData] = useState([]);
  const [error, setError] = useState(null);

  // Helper function to safely convert numeric values
  const safeParseFloat = useCallback((value) => {
    if (value === null || value === undefined) return 0;
    try {
      return typeof value === "number" ? value : parseFloat(value);
    } catch (e) {
      console.error("Error parsing float:", e, value);
      return 0;
    }
  }, []);

  const safeParseInt = useCallback((value) => {
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
  }, []);

  const calculateMA = useCallback(
    (data, days) => {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        if (i < days - 1) {
          result.push(null);
        } else {
          let sum = 0;
          for (let j = 0; j < days; j++) {
            // Ensure close is a number
            const closeValue = safeParseFloat(data[i - j].close);
            sum += closeValue;
          }
          result.push(sum / days);
        }
      }
      return result;
    },
    [safeParseFloat]
  );

  useEffect(() => {
    try {
      if (!data || data.length === 0) {
        setProcessedData([]);
        return;
      }

      // Ensure data has proper numeric types
      const typedData = data.map((item) => ({
        ...item,
        open: safeParseFloat(item.open),
        high: safeParseFloat(item.high),
        low: safeParseFloat(item.low),
        close: safeParseFloat(item.close),
        volume: safeParseInt(item.volume),
      }));

      const sortedData = [...typedData].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      let filteredData = sortedData;

      if (dateRange !== "all") {
        const today = new Date();
        let startDate;

        switch (dateRange) {
          case "1m":
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 1);
            break;
          case "3m":
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 3);
            break;
          case "6m":
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 6);
            break;
          case "1y":
            startDate = new Date(today);
            startDate.setFullYear(today.getFullYear() - 1);
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          filteredData = sortedData.filter(
            (item) => new Date(item.date) >= startDate
          );
        }
      }

      const chartData = filteredData.map((item) => {
        const open = parseFloat(item.open);
        const high = parseFloat(item.high);
        const low = parseFloat(item.low);
        const close = parseFloat(item.close);
        const volume = parseInt(item.volume, 10);

        return {
          date: new Date(item.date).toLocaleDateString(),
          open: isNaN(open) ? 0 : open,
          high: isNaN(high) ? 0 : high,
          low: isNaN(low) ? 0 : low,
          close: isNaN(close) ? 0 : close,
          volume: isNaN(volume) ? 0 : volume,

          id: item.id,
        };
      });

      if (chartData.length >= 5) {
        const ma5 = calculateMA(chartData, 5);
        chartData.forEach((item, index) => {
          item.ma5 = ma5[index];
        });
      }

      if (chartData.length >= 20) {
        const ma20 = calculateMA(chartData, 20);
        chartData.forEach((item, index) => {
          item.ma20 = ma20[index];
        });
      }

      setProcessedData(chartData);
      setError(null);
    } catch (err) {
      console.error("Error processing chart data:", err);
      setError("Failed to process chart data. Please check the data format.");
      setProcessedData([]);
    }
  }, [data, dateRange, calculateMA, safeParseFloat, safeParseInt]);

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
    const num = parseInt(value, 10);
    return isNaN(num) ? "N/A" : num.toLocaleString();
  };

  const calculateStatistics = () => {
    if (!data || data.length === 0) {
      return {
        latestClose: "N/A",
        avgClose: "N/A",
        highestPrice: "N/A",
        lowestPrice: "N/A",
        latestVolume: "N/A",
        avgVolume: "N/A",
        highestVolume: "N/A",
        lowestVolume: "N/A",
      };
    }

    try {
      const closes = data.map((item) => {
        const close = parseFloat(item.close);
        return isNaN(close) ? 0 : close;
      });

      const highs = data.map((item) => {
        const high = parseFloat(item.high);
        return isNaN(high) ? 0 : high;
      });

      const lows = data.map((item) => {
        const low = parseFloat(item.low);
        return isNaN(low) ? 0 : low;
      });

      const volumes = data.map((item) => {
        const volume = parseInt(item.volume, 10);
        return isNaN(volume) ? 0 : volume;
      });

      const latestItem = data[data.length - 1];
      const latestClose = parseFloat(latestItem.close);
      const latestVolume = parseInt(latestItem.volume, 10);

      const avgClose =
        closes.reduce((sum, val) => sum + val, 0) / closes.length;
      const highestPrice = Math.max(...highs);
      const lowestPrice = Math.min(...lows);

      const avgVolume =
        volumes.reduce((sum, val) => sum + val, 0) / volumes.length;
      const highestVolume = Math.max(...volumes);
      const lowestVolume = Math.min(...volumes);

      return {
        latestClose: isNaN(latestClose) ? "N/A" : formatNumber(latestClose),
        avgClose: formatNumber(avgClose),
        highestPrice: formatNumber(highestPrice),
        lowestPrice: formatNumber(lowestPrice),
        latestVolume: isNaN(latestVolume)
          ? "N/A"
          : formatLargeNumber(latestVolume),
        avgVolume: formatLargeNumber(Math.round(avgVolume)),
        highestVolume: formatLargeNumber(highestVolume),
        lowestVolume: formatLargeNumber(lowestVolume),
      };
    } catch (err) {
      console.error("Error calculating statistics:", err);
      return {
        latestClose: "N/A",
        avgClose: "N/A",
        highestPrice: "N/A",
        lowestPrice: "N/A",
        latestVolume: "N/A",
        avgVolume: "N/A",
        highestVolume: "N/A",
        lowestVolume: "N/A",
      };
    }
  };

  const stats = calculateStatistics();

  return (
    <div className="chart-container animate__animated animate__fadeIn">
      <div className="chart-header">
        <h3 className="chart-title">Stock Price Analysis</h3>
        <div className="chart-controls">
          <Form.Group className="date-range-selector">
            <Form.Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="custom-select"
            >
              <option value="all">All Time</option>
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </Form.Select>
          </Form.Group>

          <ButtonGroup className="chart-type-buttons">
            <Button
              variant={chartType === "line" ? "primary" : "outline-primary"}
              onClick={() => setChartType("line")}
              className="chart-btn"
            >
              Line
            </Button>
            <Button
              variant={chartType === "bar" ? "primary" : "outline-primary"}
              onClick={() => setChartType("bar")}
              className="chart-btn"
            >
              Volume
            </Button>
            <Button
              variant={chartType === "combined" ? "primary" : "outline-primary"}
              onClick={() => setChartType("combined")}
              className="chart-btn"
            >
              Combined
            </Button>
            <Button
              variant={
                chartType === "candlestick" ? "primary" : "outline-primary"
              }
              onClick={() => setChartType("candlestick")}
              className="chart-btn"
            >
              OHLC
            </Button>
          </ButtonGroup>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="animate__animated animate__fadeIn">
          {error}
        </Alert>
      )}

      {processedData.length === 0 ? (
        <Alert variant="info" className="animate__animated animate__fadeIn">
          No data available for the selected filters.
        </Alert>
      ) : (
        <>
          <Row>
            <Col>
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  {chartType === "line" && (
                    <LineChart
                      data={processedData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="close"
                        stroke="#8884d8"
                        name="Close Price"
                        dot={false}
                        activeDot={{ r: 8 }}
                      />
                      {processedData.length >= 5 && (
                        <Line
                          type="monotone"
                          dataKey="ma5"
                          stroke="#ff7300"
                          dot={false}
                          name="MA5"
                        />
                      )}
                      {processedData.length >= 20 && (
                        <Line
                          type="monotone"
                          dataKey="ma20"
                          stroke="#387908"
                          dot={false}
                          name="MA20"
                        />
                      )}
                    </LineChart>
                  )}

                  {chartType === "bar" && (
                    <BarChart
                      data={processedData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="volume" fill="#8884d8" name="Volume" />
                    </BarChart>
                  )}

                  {chartType === "combined" && (
                    <ComposedChart
                      data={processedData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="right"
                        dataKey="volume"
                        fill="#8884d8"
                        name="Volume"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="close"
                        stroke="#ff7300"
                        name="Close Price"
                        dot={false}
                        activeDot={{ r: 8 }}
                      />
                      {processedData.length >= 5 && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="ma5"
                          stroke="#387908"
                          dot={false}
                          name="MA5"
                        />
                      )}
                    </ComposedChart>
                  )}

                  {chartType === "candlestick" && (
                    <ComposedChart
                      data={processedData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={["auto", "auto"]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="low" stackId="a" fill="transparent" />
                      <Bar dataKey="open" stackId="a" fill="transparent" />
                      <Bar dataKey="close" stackId="a" fill="transparent" />
                      <Bar dataKey="high" stackId="a" fill="transparent" />
                      <Line
                        type="monotone"
                        dataKey="high"
                        stroke="#ff7300"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="low"
                        stroke="#ff7300"
                        dot={false}
                      />
                      <Area
                        type="monotone"
                        dataKey="open"
                        fill="#8884d8"
                        stroke="#8884d8"
                      />
                      <Area
                        type="monotone"
                        dataKey="close"
                        fill="#82ca9d"
                        stroke="#82ca9d"
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          <Row className="mt-4">
            <Col md={6}>
              <Card className="stats-card h-100 animate__animated animate__fadeIn">
                <Card.Header className="stats-header">
                  Price Statistics
                </Card.Header>
                <Card.Body>
                  <table className="table table-sm stats-table">
                    <tbody>
                      <tr>
                        <td className="stat-label">Latest Close</td>
                        <td className="stat-value">${stats.latestClose}</td>
                      </tr>
                      <tr>
                        <td className="stat-label">Average Close</td>
                        <td className="stat-value">${stats.avgClose}</td>
                      </tr>
                      <tr>
                        <td className="stat-label">Highest Price</td>
                        <td className="stat-value">${stats.highestPrice}</td>
                      </tr>
                      <tr>
                        <td className="stat-label">Lowest Price</td>
                        <td className="stat-value">${stats.lowestPrice}</td>
                      </tr>
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="stats-card h-100 animate__animated animate__fadeIn">
                <Card.Header className="stats-header">
                  Volume Statistics
                </Card.Header>
                <Card.Body>
                  <table className="table table-sm stats-table">
                    <tbody>
                      <tr>
                        <td className="stat-label">Latest Volume</td>
                        <td className="stat-value">{stats.latestVolume}</td>
                      </tr>
                      <tr>
                        <td className="stat-label">Average Volume</td>
                        <td className="stat-value">{stats.avgVolume}</td>
                      </tr>
                      <tr>
                        <td className="stat-label">Highest Volume</td>
                        <td className="stat-value">{stats.highestVolume}</td>
                      </tr>
                      <tr>
                        <td className="stat-label">Lowest Volume</td>
                        <td className="stat-value">{stats.lowestVolume}</td>
                      </tr>
                    </tbody>
                  </table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default StockCharts;
