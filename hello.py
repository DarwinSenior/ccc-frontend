from flask import Flask
import json
app = Flask(__name__)

@app.route("/")
def hello():
    data = json.load(open("component_files/schedule.json"))
    data = data[:5]
    return json.dumps(data)

if __name__ == "__main__":
    app.debug = True
    app.run()
