# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""




class User(Base):
    __tablename__ = 'users'
    id = Column(Integer , primary_key = True)
    name = Column(String)
    fullname = Column(String)
    password = Column(String)
    def __repr__(self):
     return "<This is %s>" % (this.name,)