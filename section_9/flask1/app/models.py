from app import db

class Tasks (db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(20), index = True)
    content = db.Column(db.String(250), index = True)
    add_time = db.Column(db.String(250), index = True)
    expire_date = db.Column(db.String(250), index = True)
    status = db.Column(db.String(20),index = True)
    principal = db.Column(db.String(20),index = True)
    email = db.Column(db.String(250),index = True)

    def __repr__(self):
        return self.task_name
