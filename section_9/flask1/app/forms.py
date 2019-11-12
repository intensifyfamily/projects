from flask_wtf import Form
from wtforms import StringField, BooleanField,  TextAreaField, SelectMultipleField, SelectField
from wtforms.fields.html5 import DateField
from wtforms.validators import DataRequired
from wtforms.ext.sqlalchemy.fields import QuerySelectField
from datetime import datetime

from .models import Student, Module, Staff


class StudentForm(Form):
    firstname = StringField('firstname', validators=[DataRequired()])
    surname = StringField('surname', validators=[DataRequired()])
    year = DateField('year', validators=[DataRequired()])
    choices = [(g.moduleCode, g.title) for g in Module.query.order_by('title')]
    modules =  SelectMultipleField('modules', coerce=int ,choices = choices)

class ModuleForm(Form):
    title = StringField('title', validators=[DataRequired()])
    ss = [(s.studentId, s.firstname+ " "+ s.surname) for s in Student.query.order_by('surname')]
    students =  SelectMultipleField('students', coerce=int ,choices = ss)
    staffs = [(s.id, s.firstname+ " "+ s.surname) for s in Staff.query.order_by('surname')]
    staff = SelectField('staff', coerce=int,choices=staffs)

class StaffForm(Form):
    firstname = StringField('firstname', validators=[DataRequired()])
    surname = StringField('surname', validators=[DataRequired()])
    title = SelectField('firstname', choices = [('Mr','Mr'),('Ms','Ms'),('Mrs','Mrs'),('Miss','Miss'),('Dr','Dr'),('Prof','Prof'),],validators=[DataRequired()])

class TaskForm(Form):
    task_name = StringField('task_name', validators=[DataRequired()])
    content = StringField('content', validators=[DataRequired()])
    expire_date = StringField('expire_date', validators=[DataRequired()])
    principal = StringField('principal', validators=[DataRequired()])
    email = StringField('email', validators=[DataRequired()])
