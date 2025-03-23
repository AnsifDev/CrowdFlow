from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import db
from model import predict_count

# Initialize Flask app
app = Flask(__name__)
CORS(app)

node_data = {}
runtime_reset = {}

def update_status(nid):
    node = node_data[nid]

    cumulative = sum([node['count'], *[ node_data[adj['target']]['count'] for adj in node['adjacent'] ] ])
    s_count = node['count']
    c_percent = cumulative/node['capacity']
    s_percent = s_count/node['capacity']

    if node['type'] == 'spawning' and s_percent > 0.75: return 'Hi Risk'
    if c_percent < 1: return 'Safe'
    if s_percent < 0.5: return 'Caution'
    if s_percent < 0.75: return 'Risk'
    return 'Hi Risk'

# Home route
@app.route('/')
def home():
    return jsonify({
        'message': 'Welcome to the Flask Server!',
        'status': 'running'
    })

@app.route('/init', methods=['POST'])
def initialize():
    node_details = db.getNodes()

    for node in node_details:
        node_data[node['_id']] = { **node_data[node['_id']], **node } if node['_id'] in node_data else { **node, 'count': 0, 'status': 'Safe' }

    return [ node_data[nid] for nid in node_data], 200

@app.route('/log', methods=['GET'])
def log():
    rt = { nid: { 'count': node_data[nid]['count'], 'status': node_data[nid]['status'] } for nid in node_data }
    
    return rt, 200

@app.route('/reset', methods=['POST'])
def reset():
    global runtime_reset
    for nid in node_data:
        runtime_reset[nid] = node_data[nid]['count'] if 'count' in node_data[nid] else 0
    
    return Response(status=200)

# Example API endpoint (POST request)
@app.route('/update/<string:nid>', methods=['POST'])
def predict(nid):
    print(nid)
    try:
        # Check if an image file is provided in the form data
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        # Get the image file from the request
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Read and convert the image to a numpy array
        output = predict_count(file)
        output = float(output)

        count = output - (runtime_reset[id] if id in runtime_reset else 0)
        # index = indexOf(node_data, nid)
        if nid in node_data:
            node_data[nid]['count'] = count
            node_data[nid]['status'] = update_status(nid)

        return Response(status=200)

    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'failed'
        }), 500

# Error handling for 404 (Not Found)
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Resource not found',
        'status': '404'
    }), 404

# Run the server
if __name__ == '__main__':
    app.run(
        debug=True, 
        host='0.0.0.0', 
        port=5000, 
        ssl_context=('/home/ansif/Port Projects/CamFeed/web-client/certificates/localhost.pem', '/home/ansif/Port Projects/CamFeed/web-client/certificates/localhost-key.pem')
    )