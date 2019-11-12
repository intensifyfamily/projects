from django.db import models
from datetime import datetime
# Create your models here.

class PatientInfo(models.Model):
    Pid = models.IntegerField(verbose_name="患者ID")
    Pname = models.CharField(max_length=50, verbose_name="患者名字", null=True, blank=True)
    Psex = models.CharField(max_length=50, choices=(('girl', '女'), ('boy', '男')), verbose_name="患者性别", default='girl')
    Page = models.IntegerField(verbose_name="患者年龄")
    Phone = models.CharField(max_length=50, verbose_name="患者电话", null=True, blank=True)
    Psfz = models.CharField(max_length=50, verbose_name="患者身份证", null=True, blank=True)
    Money = models.IntegerField(verbose_name="医药费", null=True, blank=True)
    Adds = models.CharField(max_length=200, verbose_name="用户地址", null=True, blank=True)
    Identity = models.CharField(max_length=50, choices=(('patient', '患者'), ('doctor', '医生')), verbose_name="用户类型", default='patient')
    blood = models.CharField(max_length=50, verbose_name="用户血型", null=True, blank=True)
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    def __str__(self):
        return self.Pid

    class Meta:
        verbose_name = '患者信息'
        verbose_name_plural = verbose_name

class LoginInfo(models.Model):
    Uid = models.IntegerField(verbose_name="登录者ID")
    Pwd = models.CharField(max_length=50, verbose_name="登录密码")
    Uname = models.CharField(max_length=50, verbose_name="姓名", null=True, blank=True)
    Sex = models.CharField(max_length=50, choices=(('girl', '女'), ('boy', '男'), ('unknown', '未知')), verbose_name="性别", default='unknown')
    Age = models.IntegerField(verbose_name="年龄")
    Identity = models.CharField(max_length=50, choices=(('registration', '挂号'), ('doctor', '医生')),
                                verbose_name="类型", default='registration')
    Office = models.CharField(max_length=50, verbose_name="科室", null=True, blank=True)
    stata = models.IntegerField(null=True, blank=True)
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")

    def __str__(self):
        return self.Uid

    class Meta:
        verbose_name = '登录信息'
        verbose_name_plural = verbose_name

class ConditionInfo(models.Model):
    Pname = models.CharField(max_length=50, verbose_name="患者名字", null=True, blank=True)
    Psex = models.CharField(max_length=50, choices=(('girl', '女'), ('boy', '男')), verbose_name="患者性别", default='girl')
    Page = models.IntegerField(verbose_name="患者年龄")
    Phone = models.CharField(max_length=50, verbose_name="患者电话", null=True, blank=True)
    Psfz = models.CharField(max_length=50, verbose_name="患者身份证", null=True, blank=True)
    Money = models.IntegerField(verbose_name="医药费", null=True, blank=True)
    Adds = models.CharField(max_length=200, verbose_name="患者地址", null=True, blank=True)
    blood = models.CharField(max_length=50, verbose_name="患者血型", null=True, blank=True)
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")
    condition = models.CharField(max_length=255, verbose_name="患者病况")
    def __str__(self):
        return self.Pname

    class Meta:
        verbose_name = '病况信息'
        verbose_name_plural = verbose_name

class MedicineInfo(models.Model):
    Pmedid = models.CharField(max_length=50, verbose_name="编号")
    Pmedname = models.CharField(max_length=50, verbose_name="药物名称")
    Pchangjia = models.CharField(max_length=50, verbose_name="生产厂家")
    Pdate = models.CharField(max_length=50, verbose_name="生产日期")
    bzq = models.CharField(max_length=50, verbose_name="保质期")
    using = models.CharField(max_length=50, verbose_name="用途")
    size = models.CharField(max_length=50, verbose_name="规格")
    inprice = models.CharField(max_length=50, verbose_name="进货价")
    outprice = models.CharField(max_length=50, verbose_name="销售价")
    stuffid = models.IntegerField(verbose_name="员工编号", null=True, blank=True)
    userid = models.IntegerField(verbose_name="客户编号", null=True, blank=True)
    def __str__(self):
        return self.Pmedid

    class Meta:
        verbose_name = '药物信息'
        verbose_name_plural = verbose_name


class UserToken(models.Model):

    user = models.OneToOneField(to = 'LoginInfo', on_delete=models.DO_NOTHING)
    token = models.CharField(max_length=255, verbose_name="密钥")
    add_time = models.DateTimeField(default=datetime.now, verbose_name="添加时间")
    user_type =  models.CharField(max_length=50, verbose_name="用户类型")
    def __str__(self):
        return self.user

    class Meta:
        verbose_name = '药物信息'
        verbose_name_plural = verbose_name
