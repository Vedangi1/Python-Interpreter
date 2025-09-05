from flask import Flask, request, jsonify, render_template
import io
import sys
import contextlib
from flask_cors import CORS

# Data/ML libraries
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")   # GUI disable, for backend only
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
import base64

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/run', methods=['POST'])
def run_code():
    data = request.get_json()
    code = data.get("code", "")
    user_input = data.get("input", "")

    # Redirect input/output
    sys.stdin = io.StringIO(user_input)
    output = io.StringIO()

    def secure_input(prompt=""):
        return input()

    # Safe builtins
    safe_builtins = {
        "print": print,
        "input": secure_input,
        "range": range,
        "int": int,
        "str": str,
        "float": float,
        "len": len,
        "bool": bool,
        "list": list,
        "__import__": __import__
    }

    # Allowed globals (expose ML & plotting libs)
    safe_globals = {
        "__builtins__": safe_builtins,
        "np": np,
        "pd": pd,
        "plt": plt,
        "sns": sns,
        "LinearRegression": LinearRegression
    }

    try:
        with contextlib.redirect_stdout(output):
            exec(code, safe_globals)

            # Check if plot was created
            img_data = None
            if plt.get_fignums():  # If a figure exists
                buf = io.BytesIO()
                plt.savefig(buf, format="png")
                buf.seek(0)
                img_data = base64.b64encode(buf.read()).decode("utf-8")
                plt.close("all")  # Clear after sending

        return jsonify({
            "output": output.getvalue(),
            "plot": img_data  # base64 image (None if no plot)
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
