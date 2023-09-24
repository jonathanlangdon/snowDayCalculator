from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(
    app
)  # Enable CORS for all routes, necessary for the browser to be able to send requests to your server.


@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.json
    snow_today = data.get("snowToday", 0)
    snow_tomorrow = data.get("snowTomorrow", 0)
    precip = data.get("precip", 0)
    temp = data.get("temp", 0)
    result = snow_today * snow_tomorrow * precip * temp
    return {"result": result}


if __name__ == "__main__":
    app.run(port=5000, debug=True)
