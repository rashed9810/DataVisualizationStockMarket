# Stock Market Data Visualization

A web application for visualizing and managing stock market data with a React frontend and Flask backend.

## What I Learned

Throughout the development of this project, I gained valuable experience and knowledge in several areas:

1. **Full-Stack Development**: I learned how to build a complete application with both frontend and backend components, and how to make them communicate effectively.

2. **React.js**: I deepened my understanding of React components, hooks (useState, useEffect), and state management. Working with functional components and managing component lifecycle was particularly enlightening.

3. **Flask Backend**: I learned how to create a RESTful API using Flask, including routing, request handling, and response formatting. The simplicity and flexibility of Flask made it an excellent choice for this project.

4. **Database Management**: Working with SQLite taught me about database design, CRUD operations, and data persistence. I also learned how to initialize a database with sample data.

5. **Data Visualization**: Implementing charts with Recharts gave me insights into data visualization techniques and how to present complex data in an intuitive way.

6. **API Design**: I learned best practices for designing and implementing RESTful APIs, including proper endpoint naming, HTTP methods, and status codes.

7. **Responsive Design**: Creating a UI that works well on different screen sizes was challenging but rewarding. I learned how to use Bootstrap's responsive grid system effectively.

8. **Error Handling**: Implementing robust error handling on both frontend and backend improved the reliability and user experience of the application.

## Challenges Faced

During the development of this project, I encountered several challenges:

1. **Data Synchronization**: Ensuring that the data displayed in the UI was always in sync with the backend was challenging. I had to carefully manage state and implement proper data fetching strategies.

2. **File Path Issues**: One of the most frustrating bugs was related to file paths when loading the JSON data. I initially used absolute paths which didn't work across different environments.

3. **Chart Configuration**: Configuring the charts to display financial data in a meaningful way required a deep dive into the Recharts documentation and some trial and error.

4. **Form Validation**: Implementing proper validation for the stock data entry form was more complex than anticipated, especially ensuring that high prices were greater than low prices.

5. **Database Design**: Deciding on the right schema for the stock data and ensuring efficient queries took some experimentation.

6. **Cross-Origin Resource Sharing (CORS)**: Setting up CORS correctly to allow the frontend to communicate with the backend was initially confusing.

7. **State Management**: As the application grew, managing state became more complex. I had to carefully think about where state should live and how it should be passed down to components.

8. **Performance Optimization**: Ensuring the application remained responsive with larger datasets required optimization of database queries and React rendering.

## Future Improvements

For future iterations of this project, I plan to:

1. Add user authentication and personal watchlists
2. Implement real-time data updates using WebSockets
3. Add more advanced technical indicators for stock analysis
4. Create a dashboard with customizable widgets
5. Implement data export functionality
6. Add historical data comparison features
7. Integrate with external stock market APIs for real data

## Setup and Installation

### Backend Setup
1. Navigate to the backend directory
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the Flask server: `python app.py`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Access the application at http://localhost:3000 

### Facing Problem try to solve it but not possible 
Data Type Consistency: Maintaining consistent numeric types between SQLite database, Flask API, and React frontend proved challenging. The type conversion between Python float values and JavaScript Number type required careful handling. I can not solve this problem perfectly as i was trying my best. whatever i have done this things will upload into my github file.

## Known Issues

### Numeric Data Type Conversion Error

**Error Manifestation**:
```bash
Uncaught TypeError: _data.close.toFixed is not a function
This error occurs in the following components:

StockCharts component when rendering price values

DataTable component when formatting numeric cells

Statistics calculations in price displays

Root Cause:
The application currently suffers from inconsistent numeric type handling between backend and frontend:

Backend API sometimes returns numeric fields (open, high, low, close) as strings

Frontend attempts numeric operations on string values

Database schema might not enforce strict numeric types

Technical Details:

Backend: SQLite stores numeric values as TEXT if not properly cast

API: JSON serialization might convert floats to strings in certain cases

Frontend: Missing type validation before numeric operations

Required Fixes:

Backend Type Enforcement:

# In app.py database operations
cursor.execute('''
INSERT INTO stock_data (...) VALUES (
    ?,
    ?,
    CAST(? AS REAL),  -- Explicit casting
    CAST(? AS REAL),
    CAST(? AS REAL),
    CAST(? AS REAL),
    CAST(? AS INTEGER)
)
''', (...))
API Response Validation:


# Add response schema validation
from flask_pydantic import validate

class StockResponseModel(BaseModel):
    close: float
    volume: int
    # ... other fields with type hints

@app.route('/api/data')
@validate()
def get_data():
    # Returns properly typed response
Frontend Type Safeguards:

javascript

// Convert API responses to numbers
const sanitizeStockData = (data) => ({
    ...data,
    close: Number(data.close),
    open: Number(data.open),
    high: Number(data.high),
    low: Number(data.low),
    volume: parseInt(data.volume)
});
Temporary Workaround:

javascript

// In frontend components, use safe conversion
value={item.close ? parseFloat(item.close).toFixed(2) : 'N/A'}
Verification Steps:

Check API response types:

bash

curl -s http://localhost:5000/api/data | jq '.[0] | {close: .close|type, volume: .volume|type}'
# Should show: {"close": "number", "volume": "number"}
Validate database schema:

bash

sqlite3 stock_data.db 'PRAGMA table_info(stock_data);'
# Verify NUMERIC types for price fields
I was trying my best but unfortunately, I could not solve this error. so in that case i was following different way to run my code.
