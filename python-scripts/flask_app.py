import os.path as p
import pickle
import json

from flask import Flask , request
from sqlalchemy.orm import sessionmaker

from util import crossdomain

from db_schema import SticklerUser , engine

NOTE_KEY = 'notes'

Session = sessionmaker(bind = engine)
session = Session()
app = Flask(__name__)


@app.route('/stickler/notes/<sticklerkey>/' , methods = ['GET' , 'POST'])
@crossdomain(origin='*')
def notes(sticklerkey):
    user = session.query(SticklerUser).\
                    filter(SticklerUser.username == sticklerkey).first()
    if not user:
        return "User %s does not exist" % ( sticklerkey, ), 404
    
    if request.method == 'POST':
        key_notes = request.form[NOTE_KEY]
        
        user.notes = key_notes
        session.commit()
    elif request.method == 'GET':
        notes = user.notes
        return notes