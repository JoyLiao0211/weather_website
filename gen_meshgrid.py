from flask import Flask, jsonify, render_template
import numpy as np
import json
import requests
from datetime import datetime

app = Flask(__name__)

cache_file = "F-B0046-001.json"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/rainfall_data', methods=['GET'])
def get_rainfall_data():
    with open("api.json","r",encoding='utf-8') as api:
        fn = json.load(api)
        url = fn["F-B0046-001"]
        try:
            response = requests.get(url)
            response.raise_for_status()
            forecast = response.json()
            with open(cache_file, 'w',encoding='utf-8') as f:
                json.dump(forecast, f, indent=4)

        except requests.RequestException as e:
            print(f"An error occurred: {e}")
            with open(cache_file, 'r',encoding='utf-8') as f:
                forecast = json.load(f)
    
    x = np.linspace(117.99375, 123.50625, 441)
    y = np.linspace(19.99375, 27.00625, 561)
    X, Y = np.meshgrid(x, y)
    rainstr = forecast["cwaopendata"]["dataset"]["contents"]["content"].split(",")
    rain = np.array(rainstr,dtype=float).reshape(561 , 441)

    Z = rain
    time = datetime.strptime(forecast["cwaopendata"]["dataset"]["datasetInfo"]["parameterSet"]["DateTime"],"%Y-%m-%dT%H:%M:%S+08:00")
    data = {'X': X.tolist(), 'Y': Y.tolist(), 'Z': Z.tolist(), "Datetime": time}
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
