from app import db
class ToDoList (db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(30), index = True)
    content = db.Column(db.String(255), index = True)
    create_time = db.Column(db.String(255), index = True)
    deadline = db.Column(db.String(255), index = True)
    status = db.Column(db.String(20),index = True)
    def __repr__(self):
        return self.id
