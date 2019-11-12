import datetime
import hashlib
import telnetlib
from dateutil import tz
from django.db.models import Q
from django.http import JsonResponse
from django.views import View
from app02 import models
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



class Test(View):
    def get(self, request, *args, **kwargs):
        ret = {
            "code": 1000,
        }
        all_data = models.StusInfo.objects.filter(stu_name="w").values("id")[0]
        ret['data'] = all_data["id"]

        return JsonResponse(ret)




