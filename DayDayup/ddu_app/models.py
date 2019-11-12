# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey has `on_delete` set to the desired behavior.
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class CorsheadersCorsmodel(models.Model):
    cors = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'corsheaders_corsmodel'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class StuInfo(models.Model):
    stu_name = models.CharField(max_length=64)
    stu_age = models.CharField(max_length=64)
    sex = models.CharField(max_length=64)
    stu_num = models.CharField(max_length=64)
    phone = models.CharField(max_length=64)
    college = models.CharField(max_length=64)
    class_num = models.CharField(max_length=64)
    major = models.CharField(max_length=64)
    depart = models.CharField(max_length=64)
    position = models.CharField(max_length=64)

    class Meta:
        managed = False
        db_table = 'stu_info'


class StudentInfo(models.Model):
    stu_name = models.CharField(max_length=64)
    stu_age = models.CharField(max_length=64)
    sex = models.CharField(max_length=64)
    stu_num = models.CharField(max_length=64)
    phone = models.CharField(max_length=64)
    college = models.CharField(max_length=64)
    class_num = models.CharField(max_length=64)
    major = models.CharField(max_length=64)
    depart = models.CharField(max_length=64)
    position = models.CharField(max_length=64)
    stu_id = models.CharField(max_length=64)
    nation = models.CharField(max_length=10)
    stu_addr = models.CharField(max_length=64)
    others = models.CharField(max_length=200)

    class Meta:
        managed = False
        db_table = 'student_info'


class StudentsInfo(models.Model):
    stu_name = models.CharField(max_length=64)
    stu_age = models.CharField(max_length=64)
    sex = models.CharField(max_length=64)
    stu_num = models.CharField(max_length=64)
    phone = models.CharField(max_length=64)
    college = models.CharField(max_length=64)
    class_num = models.CharField(max_length=64)
    major = models.CharField(max_length=64)
    depart = models.CharField(max_length=64)
    position = models.CharField(max_length=64)
    stu_id = models.CharField(max_length=64)
    nation = models.CharField(max_length=10)
    stu_addr = models.CharField(max_length=64)
    others = models.CharField(max_length=200)
    stu_birth = models.CharField(max_length=64)

    class Meta:
        managed = False
        db_table = 'students_info'


class UserInfo(models.Model):
    username = models.CharField(unique=True, max_length=100)
    password = models.CharField(max_length=100)
    email = models.CharField(max_length=254)
    sex = models.IntegerField()
    add_time = models.DateTimeField()
    last_login = models.DateTimeField(blank=True, null=True)
    create_ip = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'user_info'


class UserToken(models.Model):
    token = models.CharField(max_length=64)
    add_time = models.DateTimeField()
    release_time = models.DateTimeField()
    log_ip = models.CharField(max_length=50)
    user = models.ForeignKey(UserInfo, models.DO_NOTHING, unique=True)

    class Meta:
        managed = False
        db_table = 'user_token'
