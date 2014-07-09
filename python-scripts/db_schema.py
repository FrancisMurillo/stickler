# -*- coding: utf-8 -*-
"""
Created on Tue Jul  8 08:08:12 2014

This creates the schema required by the web service

@author: FVMurillo
"""

# Create engine
from sqlalchemy import create_engine
__DB_URL = "sqlite:///notes.db3"
engine = create_engine(__DB_URL)

# Declare base
from sqlalchemy.ext.declarative import declarative_base
_Base = declarative_base()

# Create single model
from sqlalchemy import Column, Integer, String, Text
class SticklerUser(_Base):
    __tablename__ = 'sticklers'
    
    id = Column (Integer , primary_key = True)
    username = Column(String , nullable = False , unique = True , index = True )
    passkey = Column(String , nullable = False)
    notes = Column(Text)
    
    def __repr__(self):
        return "<SticklerUser:%s>" % (self.username,)
        
# Commit
_Base.metadata.create_all(engine)