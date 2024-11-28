from flask import Flask, jsonify, request
from database import init_db, get_data, find_gap


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

if __name__ == '__main__':
    app.run(debug=True)
