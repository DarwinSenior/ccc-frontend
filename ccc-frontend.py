from flask import Flask, make_response, request, current_app, render_template, session, redirect, url_for, escape
from pymongo import MongoClient
import json
from datetime import timedelta
from functools import update_wrapper
from bson import Binary, Code
from bson.json_util import dumps

'''
def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator
'''

app = Flask(__name__)

@app.route('/')
def index(name=None):
    if 'username' in session:
        return render_template("index.html", name=escape(session['username']))
    return render_template("index.html", name=name)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        if request.form['username'] != '':
            try:
                connection = MongoClient()
            except:
                exit("error: Unable to connect to the database")
            db = connection.scheduler
            data = db.userInfo.find_one( {"NetID": request.form['username']}, {"_id":0, "Name":0, "Schedule":0} )
            if data != None:
                if request.form['password'] == data['Password']:
                    session['username'] = request.form['username']
                    return redirect(url_for('index'))
        return render_template('login.html', errorMsg = 'Invalid Username or Password')
    return render_template('login.html')

@app.route('/logout')
def logout():
    # remove the username from the session if it's there
    session.pop('username', None)
    return redirect(url_for('index'))

# set the secret key.  keep this really secret:
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

@app.route('/schedule')
def schedule(name=None, userData=None):
    try:
        connection = MongoClient()
    except:
        exit("error: Unable to connect to the database")
    db = connection.scheduler
    if 'username' in session:
        data = db.userInfo.find_one( {"NetID": escape(session['username'])}, {"_id":0} )
        userData = dumps(data)
    return render_template("schedule.html", name=escape(session['username']), userData=userData)

@app.route('/registration', methods=['GET', 'POST'])
def registration(name=None):
    #insert code that logs selected courses into database
    if request.method == 'POST':
        try:
            connection = MongoClient()
        except:
            exit("error: Unable to connect to the database")
        db = connection.scheduler
        db.userInfo.update( {"NetID": escape(session['username'])}, {"$set": {"Selected": request.get_json(force=True)}} )
        
        return json.dumps(request.get_json(force=True))
    return render_template("registration.html", name=escape(session['username']))

@app.route('/registration/manual')
def manual(name=None):
    return render_template("manual.html", name=escape(session['username']))

@app.route('/registration/auto')
def auto(name=None):
    return render_template("auto.html", name=escape(session['username']))

if __name__ == "__main__":
    app.run(debug = True)
