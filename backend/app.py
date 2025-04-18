import os
import json
import sqlite3
import pandas as pd
from flask_cors import CORS
from flask import Flask, request, jsonify

app = Flask(__name__)
CORS(app)


DB_PATH = os.path.join(os.path.dirname(__file__), 'stock_data.db')

def init_db():
    """Initialize the database with schema and sample data if it doesn't exist"""
    if os.path.exists(DB_PATH):
        return
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()


    cursor.execute('''
    CREATE TABLE IF NOT EXISTS stock_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        trade_code TEXT NOT NULL,
        open REAL NOT NULL,
        high REAL NOT NULL,
        low REAL NOT NULL,
        close REAL NOT NULL,
        volume INTEGER NOT NULL
    )
    ''')


    with open(os.path.join(os.path.dirname(__file__), 'stock_market_data.json'), 'r') as f:
        data = json.load(f)

    # Helper function to safely convert numeric values
    def safe_float(value):
        if value == "0" or value == 0:
            return 0.0
        try:
            return float(value)
        except (ValueError, TypeError):
            return 0.0

    def safe_int(value):
        if value == "0" or value == 0:
            return 0
        try:
            # Remove commas from volume values like "2,285,416"
            if isinstance(value, str):
                value = value.replace(",", "")
            return int(float(value))
        except (ValueError, TypeError):
            return 0

    for item in data:
        cursor.execute('''
        INSERT INTO stock_data (date, trade_code, open, high, low, close, volume)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            item['date'],
            item['trade_code'],
            safe_float(item['open']),
            safe_float(item['high']),
            safe_float(item['low']),
            safe_float(item['close']),
            safe_int(item['volume'])
        ))


    conn.commit()
    conn.close()
    print("Database initialized successfully!")


init_db()


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def load_json_data():
    with open(os.path.join(os.path.dirname(__file__), 'stock_market_data.json'), 'r') as f:
        return json.load(f)

@app.route('/api/data', methods=['GET'])
def get_data():
    source = request.args.get('source', 'sql')
    trade_code = request.args.get('trade_code')
    if source == 'json':
        data = load_json_data()
        if trade_code:
            data = [item for item in data if item['trade_code'] == trade_code]

        # Process the data to ensure numeric types
        processed_data = []
        for item in data:
            processed_item = {
                'date': item['date'],
                'trade_code': item['trade_code'],
                'open': safe_float(item['open']),
                'high': safe_float(item['high']),
                'low': safe_float(item['low']),
                'close': safe_float(item['close']),
                'volume': safe_int(item['volume'])
            }
            processed_data.append(processed_item)


        return jsonify(processed_data)
    else:
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = dict_factory
            cursor = conn.cursor()

            query = "SELECT * FROM stock_data"
            params = []

            if trade_code:
                query += " WHERE trade_code = ?"
                params.append(trade_code)


            cursor.execute(query, params)
            data = cursor.fetchall()
            conn.close()

            # Ensure all numeric fields are properly typed
            for item in data:
                item['open'] = safe_float(item['open'])
                item['high'] = safe_float(item['high'])
                item['low'] = safe_float(item['low'])
                item['close'] = safe_float(item['close'])
                item['volume'] = safe_int(item['volume'])


            return jsonify(data)
        except Exception as e:

            return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/data/<int:id>', methods=['GET'])
def get_data_by_id(id):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = dict_factory
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM stock_data WHERE id = ?", (id,))
        data = cursor.fetchone()
        conn.close()

        if data:
            # Ensure all numeric fields are properly typed
            data['open'] = safe_float(data['open'])
            data['high'] = safe_float(data['high'])
            data['low'] = safe_float(data['low'])
            data['close'] = safe_float(data['close'])
            data['volume'] = safe_int(data['volume'])
            return jsonify(data)
        else:
            return jsonify({"error": "Item not found"}), 404
    except Exception as e:

        return jsonify({"error": f"Database error: {str(e)}"}), 500

# Helper functions for type conversion
def safe_float(value):
    if value == "0" or value == 0:
        return 0.0
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0

def safe_int(value):
    if value == "0" or value == 0:
        return 0
    try:
        # Remove commas from volume values like "2,285,416"
        if isinstance(value, str):
            value = value.replace(",", "")
        return int(float(value))
    except (ValueError, TypeError):
        return 0

@app.route('/api/data', methods=['POST'])
def create_data():
    data = request.json

    required_fields = ['date', 'trade_code', 'open', 'high', 'low', 'close', 'volume']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Validate numeric fields
    try:
        open_val = safe_float(data['open'])
        high_val = safe_float(data['high'])
        low_val = safe_float(data['low'])
        close_val = safe_float(data['close'])
        volume_val = safe_int(data['volume'])
    except Exception as e:
        return jsonify({"error": f"Invalid numeric data: {str(e)}"}), 400

    # Validate data relationships
    if high_val < low_val:
        return jsonify({"error": "High price cannot be less than low price"}), 400

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
    INSERT INTO stock_data (date, trade_code, open, high, low, close, volume)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['date'],
        data['trade_code'],
        open_val,
        high_val,
        low_val,
        close_val,
        volume_val
    ))

    conn.commit()
    last_id = cursor.lastrowid
    conn.close()

    # Return properly typed data
    response_data = {
        "id": last_id,
        "date": data['date'],
        "trade_code": data['trade_code'],
        "open": open_val,
        "high": high_val,
        "low": low_val,
        "close": close_val,
        "volume": volume_val
    }

    return jsonify(response_data)

@app.route('/api/data/<int:id>', methods=['PUT'])
def update_data(id):
    data = request.json

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor = conn.cursor()


    cursor.execute("SELECT * FROM stock_data WHERE id = ?", (id,))
    item = cursor.fetchone()

    if not item:
        conn.close()
        return jsonify({"error": "Item not found"}), 404


    fields = []
    values = []

    for field in ['open', 'high', 'low', 'close', 'volume', 'date', 'trade_code']:
        if field in data:
            fields.append(f"{field} = ?")
            values.append(data[field])


    if not fields:
        conn.close()
        return jsonify({"error": "No fields to update"}), 400

    values.append(id)

    cursor.execute(f'''
    UPDATE stock_data
    SET {', '.join(fields)}
    WHERE id = ?
    ''', values)

    conn.commit()


    cursor.execute("SELECT * FROM stock_data WHERE id = ?", (id,))
    updated_item = cursor.fetchone()

    conn.close()

    return jsonify(updated_item)

@app.route('/api/data/<int:id>', methods=['DELETE'])
def delete_data(id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM stock_data WHERE id = ?", (id,))
    item = cursor.fetchone()

    if not item:
        conn.close()
        return jsonify({"error": "Item not found"}), 404

    cursor.execute("DELETE FROM stock_data WHERE id = ?", (id,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Item deleted successfully"})

@app.route('/api/trade_codes', methods=['GET'])
def get_trade_codes():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT DISTINCT trade_code FROM stock_data")
    codes = [row[0] for row in cursor.fetchall()]

    conn.close()

    return jsonify(codes)

@app.route('/api/statistics/<trade_code>', methods=['GET'])
def get_statistics(trade_code):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = dict_factory
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM stock_data WHERE trade_code = ?", (trade_code,))
        data = cursor.fetchall()
        conn.close()

        if not data:
            return jsonify({"error": f"No data found for trade code {trade_code}"}), 404

        # Ensure numeric types before creating DataFrame
        for item in data:
            item['open'] = safe_float(item['open'])
            item['high'] = safe_float(item['high'])
            item['low'] = safe_float(item['low'])
            item['close'] = safe_float(item['close'])
            item['volume'] = safe_int(item['volume'])

        df = pd.DataFrame(data)

        stats = {
            "count": len(df),
            "avg_close": float(df["close"].mean()),
            "max_close": float(df["close"].max()),
            "min_close": float(df["close"].min()),
            "avg_volume": float(df["volume"].mean()),
            "max_volume": int(df["volume"].max()),
            "min_volume": int(df["volume"].min()),
            "volatility": float(df["close"].std())
        }

        return jsonify(stats)
    except Exception as e:

        return jsonify({"error": f"Error processing statistics: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)