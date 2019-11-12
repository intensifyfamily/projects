from django.http import JsonResponse
from django.views import View
from hospital import models
from django.shortcuts import HttpResponse, reverse, redirect
import random


# 1004 邮箱已存在
# 1005 1003 token过期
# 1000登录成功，1001用户名或密码错误，1002用户不存在
# 1008 订单填写表单错误
# 1009 ip注册账号上限


# token加密函数
def md6(user):
    import hashlib
    import time
    # 当前时间，相当于生成一个随机的字符串
    ctime = str(time.time())
    m = hashlib.md5(bytes(user, encoding='utf-8'))
    m.update(bytes(ctime, encoding='utf-8'))
    m.update(bytes("那我大尺寸", encoding='utf-8'))
    return m.hexdigest()


# key加密函数
def md4(key):
    import hashlib
    import time
    # 当前时间，相当于生成一个随机的字符串
    ctime = str(time.time())
    m = hashlib.md5()
    m.update(bytes('柯尼卡发欧破', encoding='utf-8'))
    m.update(bytes(key, encoding='utf-8'))
    m.update(bytes(ctime, encoding='utf-8'))
    return m.hexdigest()


def get_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]  # 所以这里是真实的ip
    else:
        ip = request.META.get('REMOTE_ADDR')  # 这里获得代理ip
    return ip

# 注册
class SignupView(View):

    def post(self, request, *args, **kwargs):
        ret = {
            "code": 1201,
            "msg": None,
        }
        code = request.POST.get('code')
        if code != '1002':
            return HttpResponse("code错误")
        username = request.POST.get('username')
        password = request.POST.get('password')
        sex = request.POST.get('sex')
        age= request.POST.get('age')
        type= request.POST.get('type')
        department= request.POST.get('department')
        if not department:
            department = '患者'

        username_check = models.LoginInfo.objects.filter(Uname=username).first()
        if username_check:
            ret['code'] = 1301
            ret['msg'] = "账户已存在！"
        else:
            Uid = random.randint(100000,1000000)
            while models.LoginInfo.objects.filter(Uid=Uid):
                Uid = random.randint(100000, 1000000)
            models.LoginInfo.objects.create(
                Uid = Uid,
                Pwd = password,
                Uname = username,
                Sex = sex,
                Age = age,
                Identity = type,
                Office = department
            )

        return JsonResponse(ret)
    def get(self, request, *args, **kwargs):
        return HttpResponse("这是注册页")


# 登录
class AuthView(View):

    def post(self, request, *args, **kwargs):
        ret = {
            'code': 1201,
            'msg': None
        }
        # try:
        code = request.POST.get('code')
        type = request.POST.get('type')
        username = request.POST.get('username')
        pwd = request.POST.get('pwd')
        obj = models.LoginInfo.objects.filter(Uname=username, Pwd=pwd).first()
        if obj:
            obj_v = models.LoginInfo.objects.filter(Uname=username, Pwd=pwd).values('Uid', 'Office')[0]
            Uid = obj_v['Uid']
            department = obj_v['Office']
        else:
            ret['code'] = 1301
            ret['msg'] = '用户名或密码错误'
            return JsonResponse(ret)
        # 为用户创建token
        token = md6(username)
        # 存在就更新，不存在就创建
        models.UserToken.objects.update_or_create(user=obj, defaults={'token': token, 'user_type': type})
        ret['token'] = token
        ret['Uname'] = username
        ret['Uid'] = Uid
        ret['type'] = type
        ret['department'] = department
        # except Exception as e:
        #     ret['code'] = 1301
        #     ret['msg'] = '用户不存在，请注册'
        return JsonResponse(ret)

    def get(self, request, *args, **kwargs):
        return HttpResponse("这是登录页")


# 医生
class DoctorView(View):

    def post(self, request, *args, **kwargs):
        ret = {
            "code": 1201,
            "msg": None,
        }
        token = request.POST.get('token')

        try:
            token_test = models.UserToken.objects.filter(token=token)
            if not token_test:
                ret['code'] = 1301
                ret['msg'] = "请登录"
                return JsonResponse(ret)
        except Exception as e:
            ret['code'] = 1301
            ret['msg'] = "请登录"
            return JsonResponse(ret)

        return JsonResponse(ret)

    def get(self, request, *args, **kwargs):
        ret = {
            "code": 1201,
            "msg": None,
        }
        token = request.GET.get('token')
        department = request.GET.get('department')
        # token_check = models.UserToken.objects.filter(token=token)
        # if not token_check:
        #     ret['code'] = 1301
        #     ret['msg'] = "请登录"
        #     return JsonResponse(ret)
        try:
            ooo = models.PatientInfo.objects.all().values("Pid", "Pname", "add_time", "Page", "Psex", "Adds")
            ret['list'] = list(ooo)
            return JsonResponse(ret)
        except Exception as e:
            ret['code'] = 1302
            ret['msg'] = '暂时没有病人'
            return JsonResponse(ret)

class DeleteView(View):
    def get(self, request, *args, **kwargs):
        ret = {
            "code": 1201,
            "msg": None,
        }
        username = request.GET.get('username')
        try:
            ooo = models.PatientInfo.objects.filter(Pname=username).delete()
        except Exception as e:
            ret['code'] = 1302
            ret['msg'] = '没有该病人'
        return HttpResponse('success!')


class EditView(View):
    def get(self, request, *args, **kwargs):
        ret = {
            'code': 1201,
            'msg': None
        }
        idcd = request.GET.get('idcd')
        name = request.GET.get('name')
        age = request.GET.get('age')
        sex = request.GET.get('sex')
        blood = request.GET.get('blood')
        cost = request.GET.get('cost')
        phone = request.GET.get('phone')
        addr = request.GET.get('addr')
        condition = request.GET.get('condition')
        models.ConditionInfo.objects.create(
            Pname=name,
            Psex = sex,
            Page = int(age),
            Phone = phone,
            Psfz = idcd,
            Money = int(cost),
            Adds = addr,
            blood = blood,
            condition = condition,
        )
        models.PatientInfo.objects.filter(Pname=name).delete()
        return JsonResponse(ret)

# 病人
class PatientView(View):

    def post(self, request, *args, **kwargs):
        ret = {
            "code": 1201,
            "msg": None,
        }
        userid = request.POST.get('userid')
        username = request.POST.get('username')
        sex = request.POST.get('sex')
        age = request.POST.get('age')
        phone = request.POST.get('phone')
        addr = request.POST.get('addr')
        blood = request.POST.get('blood')
        idcd = request.POST.get('idcd')

        models.PatientInfo.objects.create(
            Pid=userid,
            Pname=username,
            Psex=sex,
            Page=age,
            Phone=phone,
            Adds=addr,
            Psfz=idcd,
            blood=blood,
        )
        return JsonResponse(ret)

    def get(self, request, *args, **kwargs):
        ret = {
            "code": 1201,
        }
        Pname = request.GET.get('Pname')
        ooo = models.PatientInfo.objects.filter(Pname=Pname).values("Pid", "Pname", "Page", "Psex", "Adds", "Psfz", "blood", "Phone")
        ret['list'] = list(ooo)
        return JsonResponse(ret)

# 挂号
class RegisterView(View):

    def post(self, request, *args, **kwargs):
        ret = {
            "code": 1201,
            "msg": None,
        }
        token = request.POST.get('token')
        try:
            token_test = models.UserToken.objects.filter(token=token)
            if not token_test:
                ret['code'] = 1301
                ret['msg'] = "请登录"
                return JsonResponse(ret)
        except Exception as e:
            ret['code'] = 1301
            ret['msg'] = "请登录"
            return JsonResponse(ret)

        return JsonResponse(ret)

    def get(self, request, *args, **kwargs):
        ret = {
            "code": 1201,
            "msg": None,
        }
        # token = request.GET.get('token')
        # userid = request.GET.get('userid')
        # token_check = models.UserToken.objects.filter(token=token)
        # if not token_check:
        #     ret['code'] = 1301
        #     ret['msg'] = "请登录"
        #     return JsonResponse(ret)
        try:
            ooo = models.LoginInfo.objects.filter(Identity='doctor').values("Uid", "Uname", "Office")
            ret['list'] = list(ooo)
            return JsonResponse(ret)
        except Exception as e:
            ret['code'] = 1302
            ret['msg'] = '暂时没有医生'
            return JsonResponse(ret)





