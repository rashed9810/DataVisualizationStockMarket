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

## Recent Improvements

### Fixed Data Type Consistency Issues

We've successfully resolved the data type consistency issues between the SQLite database, Flask API, and React frontend:

1. **Backend Improvements**:

   - Implemented robust type conversion using `safe_float()` and `safe_int()` helper functions
   - Added proper error handling for all database operations
   - Enhanced logging for better debugging and troubleshooting

2. **Frontend Improvements**:

   - Added better error handling for network requests
   - Implemented loading states with visual feedback
   - Enhanced form validation for numeric inputs

3. **API Enhancements**:
   - Improved error reporting with detailed messages
   - Added request/response logging for easier debugging
   - Implemented proper CORS configuration

### UI/UX Enhancements

1. **Data Table**:

   - Fixed save button loading state
   - Improved error handling during edit operations
   - Enhanced numeric formatting for better readability

2. **Data Source Toggle**:

   - Both JSON and SQL data sources now work correctly
   - Smooth transition between data sources

3. **Delete Confirmation**:
   - Added animated confirmation dialog
   - Improved error handling during delete operations

## Troubleshooting

If you encounter any issues:

1. **Network Error: Cannot connect to the server**

   - Ensure the backend server is running on port 5000
   - Check if there are any firewall restrictions
   - Verify that CORS is properly configured

2. **Data Loading Issues**

   - Check if the database file exists and has proper permissions
   - Verify that the JSON data file is properly formatted
   - Check the backend server logs for any errors

3. **UI Rendering Problems**
   - Clear your browser cache and reload the page
   - Check the browser console for any JavaScript errors
   - Verify that all required dependencies are installed
