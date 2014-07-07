
# A very simple Flask Hello World app for you to get started with...

from flask import Flask , request

import os.path as p
import pickle

from util import crossdomain

NOTE_FILE = 'stickler/notes.dat'
NOTE_KEY = 'notes'


app = Flask(__name__)

@app.route('/stickler/')
def hello_world():
    return 'Hello from Flask!'

@app.route('/stickler/notes/<sticklerkey>/' , methods = ['GET' , 'POST'])
@crossdomain(origin='*')
def notes(sticklerkey):
    if request.method == 'POST':
        notes = None
        with open(NOTE_FILE , 'rb') as file:
            notes = pickle.load(file)

        key_notes = request.form[NOTE_KEY]
        notes[sticklerkey] = key_notes

        with open(NOTE_FILE , 'wb') as file:
            pickle.dump(notes , file)

        return key_notes
    elif request.method == 'GET':
        notes = None
        if not p.exists(NOTE_FILE):
            with open(NOTE_FILE , 'wb') as file:
                pickle.dump({} , file)

        with open(NOTE_FILE , 'rb') as file:
            notes = pickle.load(file)
        return notes[sticklerkey] if sticklerkey in notes else ''

app.debug = True