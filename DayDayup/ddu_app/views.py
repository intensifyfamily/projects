import datetime
import hashlib
import telnetlib
from dateutil import tz
from django.db.models import Q
from django.http import JsonResponse
from django.views import View
from ddu_app import models
# Create your views here.


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
        ip = x_forwarded_for.split(',')[0]#所以这里是真实的ip
    else:
        ip = request.META.get('REMOTE_ADDR')#这里获得代理ip
    return ip

#1000 操作成功
#1001 注册用户名已存在
#1002 登录用户名不存在
#1003 登录密码错误
#1004 token过期
#1005 获取用户信息出错
class SignUpView(View):
    def post(self, request, *args, **kwargs):
        ret = {
            "code": 1000,
            "msg": None,
        }
        username = request.POST.get('username')
        sex = request.POST.get('sex')
        password = request.POST.get('pwd')
        email = request.POST.get('email')
        if sex=='b':
            sex = 1
        elif sex == 'g':
            sex = 2
        else:
            sex = 3
        now = (datetime.datetime.now(tz=tz.gettz('Asia/Shanghai')) + datetime.timedelta(hours=8))
        username_check = models.UserInfo.objects.filter(username=username)
        if username_check:
            ret['code'] = 1001
            ret['msg'] = "用户名已存在！"
            return JsonResponse(ret)
        models.UserInfo.objects.create(
            username=username,
            password=password,
            sex=sex,
            email=email,
            add_time=now,
            create_ip=get_ip(request)
        )
        ret['msg'] = "注册成功！"
        return JsonResponse(ret)

class LogInView(View):
    def post(self, request, *args, **kwargs):
        ret = {
            "code": 1000,
            "msg": None,
        }
        username = request.POST.get('username')
        password = request.POST.get('pwd')
        try:
            for_id = models.UserInfo.objects.filter(username=username).values("id")[0]
            id = for_id['id']
            log_check = models.UserInfo.objects.filter(username=username,password=password).first()
            if not log_check:
                ret['code'] = 1003
                ret['msg'] = "密码错误！"
                return JsonResponse(ret)

            # 为用户创建token
            token = md6(username)
            now = (datetime.datetime.now(tz=tz.gettz('Asia/Shanghai')) + datetime.timedelta(hours=8))
            r_time = (datetime.datetime.now(tz=tz.gettz('Asia/Shanghai')) + datetime.timedelta(hours=32))
            # 存在就更新，不存在就创建
            models.UserInfo.objects.filter(username=username).update(last_login=now)
            models.UserToken.objects.update_or_create(user=log_check, defaults={'token': token, 'add_time': now, 'release_time': r_time, 'log_ip': get_ip(request)})
            ret['token'] = token
            ret['user_id'] = id
            ret['msg'] = "登录成功！"
        except:
            ret['code'] = 1002
            ret['msg'] = "用户名不存在！"
        return JsonResponse(ret)

class GetUserView(View):
    def get(self, request, *args, **kwargs):
        ret = {
            "code": 1000,
            "msg": None,
        }
        token = request.GET.get('token')
        user_id = request.GET.get('user_id')
        token_test = models.UserToken.objects.filter(token=token)
        if not token_test:
            ret['code'] = 1004
            ret['msg'] = "用户信息以过期，请重新登录"
            return JsonResponse(ret)
        try:
            ooo = models.UserInfo.objects.filter(sex=1).values("username", "email", "sex", "add_time")
            # ret['msg'].append([ooo['order_num'],ooo['order_type'],ooo['num'],ooo['add_time']])
            ret['msg'] = list(ooo)
        except Exception as e:
            ret['code'] = 1005
            ret['msg'] = "error!"
        return JsonResponse(ret)




class GetInfo(View):
    def post(self, request, *args, **kwargs):
        ret={
            "code": 1000,
            "msg": "",
        }
        stu_name = request.POST.get('stu_name')
        stu_age = request.POST.get('stu_age')
        sex = request.POST.get('sex')
        stu_num = request.POST.get('stu_num')
        phone = request.POST.get('phone')
        college = request.POST.get('college')
        class_num = request.POST.get('class_num')
        major = request.POST.get('major')
        depart = request.POST.get('depart')
        position = request.POST.get('position')
        if sex == "1":
            sex = "男"
        elif sex =="2":
            sex = "女"
        else:
            sex = "未知"

        models.StuInfo.objects.create(
            stu_name = stu_name,
            stu_age = stu_age,
            sex = sex,
            stu_num = stu_num,
            phone = phone,
            college = college,
            class_num = class_num,
            major = major,
            depart = depart,
            position = position
        )
        ret['msg'] = "提交成功"
        return JsonResponse(ret)




