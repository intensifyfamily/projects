from flask import render_template, redirect, request
from app import app, db, admin
from sqlalchemy import or_
from .models import Tasks
from .send_email import mailhelper
from datetime import datetime

@app.route("/")
def homepage():
        return render_template('index.html',
                               title='homepage',
                             )

# task视图
@app.route('/task', methods=['GET', 'POST'])
def getAllTask():
    if request.method == 'GET':
        task = Tasks.query.all()
        #数据库查询
        count = Tasks.query.filter_by(status='unfinished').count()
        return render_template('task_list.html',
                               title='All Task',
                               task=task,
                               count=count)
    if request.method == 'POST':
        search_str = request.form.get('search_str')
        count = Tasks.query.filter_by(status='unfinished').count()
        #模糊查找
        search_task = Tasks.query.filter(
        or_(Tasks.task_name.like("%" + search_str + "%") if search_str is not None else "",
        Tasks.content.like("%" + search_str + "%") if search_str is not None else "",
        Tasks.expire_date.like("%" + search_str + "%") if search_str is not None else "",
        Tasks.status.like("%" + search_str + "%") if search_str is not None else "")
 ).all()
        return render_template('task_list.html',
                               title='All Task',
                               task=search_task,
                               count=count)

# 编辑
@app.route('/edit', methods=['GET', 'POST'])
def editTask():
    if request.method == 'POST':
        id = request.form.get('id')
        #更新数据
        edit_task = Tasks.query.filter_by(id=id).first()
        edit_task.task_name = request.form.get('task_name')
        edit_task.content = request.form.get('content')
        edit_task.expire_date = request.form.get('expire_date')
        edit_task.principal = request.form.get('principal')
        edit_task.email = request.form.get('email')
        task = Tasks.query.all()
        count = Tasks.query.filter_by(status='unfinished').count()
        return render_template('task_list.html',
                               title='All Task',
                               task=task,
                               count=count)

# 创建task视图
@app.route('/create_task', methods=['GET','POST'])
def create_task():
    if request.method == 'POST':
        task_name = request.form.get('task_name')
        content = request.form.get('content')
        expire_date = request.form.get('expire_date')
        principal = request.form.get('principal')
        email = request.form.get('email')
        now = datetime.now()
        now.strftime('%c')

        t = Tasks(
            task_name=task_name,
            content = content,
            add_time = now,
            expire_date = expire_date,
            status = "unfinished",
            principal = principal,
            email = email)
        # 添加新数据
        db.session.add(t)
        # 提交处理
        db.session.commit()
        #邮件模块
        mailto_list = [email]
        content = '成功创建一个未完成项！'
        if mailhelper().send_mail(mailto_list, "todolist", content):
            print("发送成功")
        else:
            print("发送失败")
        return redirect('/task')
    else:
        return render_template('create_task.html',
                            title='Create Task')

@app.route('/finish_task/<id>', methods=['GET'])
def finish_Task(id):
    Tasks.query.filter_by(id=id).update({'status': 'finished'})
    db.session.commit()
    return redirect('/task')

# 删除数据视图
@app.route('/delete_task/<id>', methods=['GET'])
def delete_task(id):
    task = Tasks.query.get(id)
    db.session.delete(task)
    db.session.commit()
    return redirect('/task')

@app.route('/finished_task', methods=['GET'])
def finishedTask():
    finished_task = Tasks.query.filter_by(status='finished').all()
    return render_template('finished_list.html',
                           title='Finished task',
                           task=finished_task,
                        )

@app.route('/ed_delete_task/<id>', methods=['GET'])
def ed_delete_task(id):
    task = Tasks.query.get(id)
    db.session.delete(task)
    db.session.commit()
    return redirect('/finished_task')

@app.route('/unfinished_task', methods=['GET'])
def unFinishedTask():
    unfinished_task = Tasks.query.filter_by(status='unfinished').all()
    count = Tasks.query.filter_by(status='unfinished').count()
    return render_template('unfinished_list.html',
                           title='Finished task',
                           task=unfinished_task,
                           count=count
                        )

@app.route('/un_finish_task/<id>', methods=['GET'])
def un_finish_task(id):
    Tasks.query.filter_by(id=id).update({'status': 'finished'})
    db.session.commit()
    return redirect('/unfinished_task')

@app.route('/un_delete_task/<id>', methods=['GET'])
def un_delete_task(id):
    task = Tasks.query.get(id)
    db.session.delete(task)
    db.session.commit()
    return redirect('/unfinished_task')


