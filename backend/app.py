import os
import json
import sqlite3
import pandas as pd
from flask_cors import CORS
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)
CORS(app) 


DB_PATH = 'stock_data.db'

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
    
    
    with open('stock_market_data.json', 'r') as f:
        data = json.load(f)
    
   
    for item in data:
        cursor.execute('''
        INSERT INTO stock_data (date, trade_code, open, high, low, close, volume)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            item['date'],
            item['trade_code'],
            item['open'],
            item['high'],
            item['low'],
            item['close'],
            item['volume']
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
    with open('stock_market_data.json', 'r') as f:
        return json.load(f)

@app.route('/api/data', methods=['GET'])
def get_data():
    source = request.args.get('source', 'sql')
    trade_code = request.args.get('trade_code')
    
    if source == 'json':
        
        data = load_json_data()
        if trade_code:
            data = [item for item in data if item['trade_code'] == trade_code]
        return jsonify(data)
    else:
       
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
        
        return jsonify(data)

@app.route('/api/data/<int:id>', methods=['GET'])
def get_data_by_id(id):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM stock_data WHERE id = ?", (id,))
    data = cursor.fetchone()
    conn.close()
    
    if data:
        return jsonify(data)
    else:
        return jsonify({"error": "Item not found"}), 404

@app.route('/api/data', methods=['POST'])
def create_data():
    data = request.json
    
    
    required_fields = ['date', 'trade_code', 'open', 'high', 'low', 'close', 'volume']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO stock_data (date, trade_code, open, high, low, close, volume)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['date'],
        data['trade_code'],
        data['open'],
        data['high'],
        data['low'],
        data['close'],
        data['volume']
    )) 
   
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    
    
    return jsonify({"id": last_id, **data})

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
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM stock_data WHERE trade_code = ?", (trade_code,))
    data = cursor.fetchall()
    conn.close()
    
    if not data:
        return jsonify({"error": f"No data found for trade code {trade_code}"}), 404
    
    
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

if __name__ == '__main__':
    app.run(debug=True, port=5000)