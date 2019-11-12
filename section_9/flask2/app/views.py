from flask import render_template, flash, redirect, session, url_for, request, g, render_template_string
from flask_admin.contrib.sqla import ModelView

from app import app, db, admin
from sqlalchemy import or_

from .models import ToDoList
from datetime import datetime
from .send_email import mailhelper

@app.route("/")
def homepage():
        return render_template('index.html',
                               title='homepage',
                             )
# task视图
@app.route('/task', methods=['GET', 'POST'])
def getAllTask():
    if request.method == 'POST':
        id = request.form.get("task_id")
        task_name = request.form.get("task_name")
        content = request.form.get("content")
        deadline = request.form.get("deadline")
        ToDoList.query.filter_by(id=id).update({
            'task_name': task_name,
            'content': content,
            'deadline': deadline,
        })
        db.session.commit()
        task = ToDoList.query.all()
        return render_template('task_list.html',
                               task=task,
                               )
    else:
        task = ToDoList.query.all()
        return render_template('task_list.html',
                               task=task)

@app.route('/search', methods=['GET', 'POST'])
def searchTask():
    if request.method == 'POST':
        search_str = request.form.get('search_str')
        if search_str:
            search_task = ToDoList.query.filter(
                or_(ToDoList.task_name.like("%" + search_str + "%") if search_str is not None else "",
                    ToDoList.content.like("%" + search_str + "%") if search_str is not None else "",
                    ToDoList.deadline.like("%" + search_str + "%") if search_str is not None else "")
            ).all()
            print(search_str)
            return render_template('task_list.html',
                                   task=search_task)
    else:
        task = ToDoList.query.all()
        return render_template('task_list.html',
                               task=task)


@app.route('/create_task', methods=['GET','POST'])
def create_task():
    if request.method == 'POST':
        task_name = request.form.get('task_name')
        content = request.form.get('content')
        deadline = request.form.get('deadline')
        now = datetime.now()
        now.strftime('%c')
        t = ToDoList(
            task_name=task_name,
            content = content,
            create_time = now,
            deadline = deadline,
            status = "uncompleted",
        )
        db.session.add(t)
        db.session.commit()
        return redirect('/task')
    else:
        return render_template('create_task.html',
                            title='Create Task',
                               )

@app.route('/complete_task/<id>', methods=['GET'])
def complete_Task(id):
    ToDoList.query.filter_by(id=id).update({'status': 'completed'})
    db.session.commit()
    return redirect('/task')

@app.route('/delete_task/<id>', methods=['GET'])
def delete_task(id):
    task = ToDoList.query.get(id)
    db.session.delete(task)
    db.session.commit()
    return redirect('/task')

@app.route('/completed_task', methods=['GET', 'POST'])
def completedTask():
    if request.method == 'POST':
        id = request.form.get("task_id")
        task_name = request.form.get("task_name")
        content = request.form.get("content")
        deadline = request.form.get("deadline")
        ToDoList.query.filter_by(id=id).update({
            'task_name': task_name,
            'content': content,
            'deadline': deadline,
        })
        db.session.commit()
        completed_task = ToDoList.query.filter_by(status='completed').all()
        return render_template('completed_list.html',
                               task=completed_task,
                               )
    else:
        completed_task = ToDoList.query.filter_by(status='completed').all()
        return render_template('completed_list.html',
                               task=completed_task,
                            )

@app.route('/ed_delete_task/<id>', methods=['GET'])
def ed_delete_task(id):
    task = ToDoList.query.get(id)
    db.session.delete(task)
    db.session.commit()
    return redirect('/completed_task')

@app.route('/uncompleted_task', methods=['GET', 'POST'])
def uncompletedTask():
    if request.method == 'POST':
        id = request.form.get("task_id")
        task_name = request.form.get("task_name")
        content = request.form.get("content")
        deadline = request.form.get("deadline")
        ToDoList.query.filter_by(id=id).update({
            'task_name': task_name,
            'content': content,
            'deadline': deadline,
        })
        db.session.commit()
        uncompleted_task = ToDoList.query.filter_by(status='uncompleted').all()
        return render_template('uncompleted_list.html',
                               task=uncompleted_task,
                               )
    else:
        uncompleted_task = ToDoList.query.filter_by(status='uncompleted').all()
        return render_template('uncompleted_list.html',
                               task=uncompleted_task
                            )

@app.route('/un_complete_task/<id>', methods=['GET'])
def un_complete_task(id):
    ToDoList.query.filter_by(id=id).update({'status': 'completed'})
    db.session.commit()
    return redirect('/uncompleted_task')

@app.route('/un_delete_task/<id>', methods=['GET'])
def un_delete_task(id):
    task = ToDoList.query.get(id)
    db.session.delete(task)
    db.session.commit()
    return redirect('/uncompleted_task')


