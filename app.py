import threading
from flask import Flask, request, jsonify, render_template
import io
import sys
import contextlib
from flask_cors import CORS


import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.linear_model import LinearRegression
import base64


import pygame


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

    sys.stdin = io.StringIO(user_input)
    output = io.StringIO()

    def secure_input(prompt=""):
        return input()

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

    safe_globals = {
        "__builtins__": safe_builtins,
        "np": np,
        "pd": pd,
        "plt": plt,
        "sns": sns,
        "LinearRegression": LinearRegression,
        "pygame": pygame
    }

    try:
        with contextlib.redirect_stdout(output):
            exec(code, safe_globals)

            img_data = None
            if plt.get_fignums():
                buf = io.BytesIO()
                plt.savefig(buf, format="png")
                buf.seek(0)
                img_data = base64.b64encode(buf.read()).decode("utf-8")
                plt.close("all")

        return jsonify({
            "output": output.getvalue(),
            "plot": img_data
        })

    except Exception as e:
        return jsonify({"error": str(e)})

def run_flask():
    app.run(debug=True, use_reloader=False)


if __name__ == '__main__':
    run_flask()
