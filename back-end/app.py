from flask import Flask, jsonify, request
from database import init_db, get_data, find_gap, get_data_for_last_hours

app = Flask(__name__)

@app.before_request
def setup():
    init_db()

@app.route('/get_data', methods=['GET'])
def api_get_data():
    minutes = int(request.args.get('minutes', 3))
    data = get_data(minutes)
    return jsonify(data)

@app.route('/find_gap', methods=['GET'])
def api_find_gap():
    gaps = find_gap()
    return jsonify(gaps)

@app.route('/filter_data', methods=['GET'])
def api_filter_data():
    hours = int(request.args.get('hours', 2))
    data = get_data_for_last_hours(hours)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)

# http://127.0.0.1:5000/get_data?minutes=3
# http://127.0.0.1:5000/find_gap 