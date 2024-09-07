from flask import Flask, jsonify, render_template
import numpy as np
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/rainfall_data', methods=['GET'])
def get_rainfall_data():
    
    x = np.linspace(120.0, 122.0, 50)
    y = np.linspace(23.5, 25.5, 50)
    X, Y = np.meshgrid(x, y)
    Z = np.random.uniform(0, 100, X.shape)

    data = {'X': X.tolist(), 'Y': Y.tolist(), 'Z': Z.tolist()}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
