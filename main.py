import os
import re
import signal
import string
import threading
import time

import flask
import waitress
import pymysql
import random

HOST_ADDRESS = "127.0.0.1"
HOST_PORT = 80

DB_CREDENTIALS = {
    "host": '127.0.0.1',  # database ip address
    "port": 3306,  # database port
    "database": 'shortener',  # database name
    "user": 'root',  # database user
    "password": '',  # database user password
    "autocommit": True
}

app = flask.Flask(__name__)


@app.route("/favicon.ico")
def favicon():
    return ''


@app.route("/<ref>")
def display_ref(ref=None):
    cursor = get_cursor()

    cursor.execute("select target from urls where ref = %s", (ref,))
    result = cursor.fetchone()
    print(result)
    cursor.close()

    if result is None:
        return flask.redirect("/")

    result = result['target']
    if not re.match(r"^\w+:/\/", result):
        result = f"https://{result}"

    return flask.redirect(result)


@app.route("/")
def index():
    return flask.render_template('index.html')


@app.route("/api/process_url", methods=['POST'])
def process_url():
    url = flask.request.json.get("url", None)
    if url is None:
        return flask.jsonify({'code': 'invalid-url'}), 400

    cursor = get_cursor()
    while True:
        ref = "".join(random.sample(string.ascii_lowercase, 5))
        cursor.execute('SELECT * FROM urls where ref = %s', (ref,))
        if not cursor.fetchone():
            break

    cursor.execute("insert into urls (ref, target) VALUES (%s, %s)", (ref, url))
    cursor.close()
    return flask.jsonify({'code': 'completed', 'ref': f"{flask.request.host}/{ref}"})


def get_cursor():
    return connection.cursor(pymysql.cursors.DictCursor)


connection = None


def connect_to_database():
    global connection
    try:
        connection = pymysql.connect(
            **DB_CREDENTIALS
        )
    except Exception as ex:
        print(
            "\033[0;31mCouldnt connect to database. Without database connection it is impossible to use core features. Check database "
            f"connection and restart the program.\nError: {ex}\033[0m")
        connection = -1


if __name__ == "__main__":
    print("Starting up")
    threading.Thread(target=connect_to_database).start()
    while True:
        time.sleep(0.5)
        if connection == -1:
            os.kill(os.getpid(), signal.SIGINT)
        elif connection is not None:
            break

    print("Database connection succeded! App server starting...")
    app.run(host=HOST_ADDRESS, port=HOST_PORT)
