import re
import string
import threading

import flask
import waitress
import pymysql
import random

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


def connect_to_database():
    global connection
    connection = pymysql.connect(
        host='127.0.0.1',
        port=3306,
        database='shortener',
        autocommit=True,
        user='root',
        password=''
    )


if __name__ == "__main__":
    threading.Thread(target=connect_to_database).start()
    app.run(host='0.0.0.0', port=80)
