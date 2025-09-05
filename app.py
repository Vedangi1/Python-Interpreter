from flask import Flask, request, jsonify, render_template
import io
import sys
import contextlib
from flask_cors import CORS

# Force Matplotlib to use Tkinter GUI backend
import matplotlib
matplotlib.use("TkAgg")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tkinter as tk   # Tkinter support

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

    # Redirect input and output
    sys.stdin = io.StringIO(user_input)
    output = io.StringIO()

    def secure_input(prompt=""):
        return input()

    # Safe builtins (still risky for production, but ok for practice)
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
        "__import__": __import__  # Allow imports
    }

    safe_globals = {
        "__builtins__": safe_builtins
    }

    try:
        with contextlib.redirect_stdout(output):
            exec(code, safe_globals)
        return jsonify({"output": output.getvalue()})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    # Disable reloader → Tkinter/plt.show() will work fine
    app.run(debug=True, use_reloader=False)
