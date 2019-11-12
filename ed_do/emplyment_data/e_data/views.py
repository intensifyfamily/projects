from django import forms
from django.shortcuts import render, render_to_response
from django.http import HttpResponse,HttpResponseRedirect
from django.template import RequestContext
from .models import AuthUser,DjangoSession, AuthUserLog, EmployData
import datetime
from dateutil import tz
import json
import hashlib
#order=1 登录
#order=-1 注销
#order=0 错误
# #接收表单
class UserForm(forms.Form):
    firstname = forms.CharField(label='firstname', max_length=30, required=True)
    lastname = forms.CharField(label='lastname', max_length=150, required=True)
    username = forms.CharField(label='username', max_length=50, required=True)
    password = forms.CharField(label='password', widget=forms.PasswordInput())
    email = forms.EmailField(label='email')

class LogInForm(forms.Form):
    username = forms.CharField(label='username', max_length=50, required=True)
    password = forms.CharField(label='password', widget=forms.PasswordInput())


def index(request):
    # return render(request, 'home/index.html')


    # 提取浏览器中的cookie，如果不为空，表示已经登录
    username = request.COOKIES.get('username', '')
    if not username:
        return HttpResponseRedirect('/login/')
    return render(request, 'home/charts.html', {'username': username})




def signup(request):
    if request.method == 'POST':
        uf = UserForm(request.POST)
        if uf.is_valid():
            first_name = uf.cleaned_data['firstname']
            last_name = uf.cleaned_data['lastname']
            user_name = uf.cleaned_data['username']
            user_pass = uf.cleaned_data['password']
            user_email = uf.cleaned_data['email']
            repe = AuthUser.objects.filter(username=user_name)
            if repe:
                return HttpResponse('用户名已存在，请重新输入')
            else:

                date_join = (datetime.datetime.now(tz=tz.gettz('Asia/Shanghai')) + datetime.timedelta(hours=8))
                AuthUser.objects.create(
                    first_name = first_name,
                    last_name = last_name,
                    username = user_name,
                    password = user_pass,
                    email = user_email,
                    date_joined = date_join,
                    is_superuser = 0,
                    is_staff = 0,
                    is_active = 0,
                )
                return HttpResponseRedirect('/')
        else:
            return HttpResponse('输入格式错误!', {'err':uf})

    else:
        uf = UserForm()
    return render(request, 'home/signup.html', {'uf':uf})

def login(request):
    if request.method == "POST":
        lf = LogInForm(request.POST)
        if lf.is_valid():
            username = lf.cleaned_data['username']
            password = lf.cleaned_data['password']
            repe = AuthUser.objects.filter(username=username,password=password)
            if repe:
                name = AuthUser.objects.get(username=username).username
                userid = AuthUser.objects.get(username=username).id
                now = (datetime.datetime.now(tz=tz.gettz('Asia/Shanghai')) + datetime.timedelta(hours=8))
                AuthUserLog.objects.create(
                    userid = userid,
                    username = username,
                    addtime = now,
                )
                repe.update(last_login = now)
                request.session['username'] = name

                response = HttpResponseRedirect('/')
                 # 将username写入浏览器cookie，失效时间为360s
                response.set_cookie('username', name, 3600)
                return response
            else:
                return render(request, 'home/login.html', {'err': '账号或密码错误！'})



        else:
            return render(request, 'home/login.html', {'err': '请输入账号或密码！'})

    return render(request, 'home/login.html')


def spiderdata(request):
    if request.method == "GET":
        import time
        from lxml import etree
        import requests
        from multiprocessing.dummy import Pool as ThreadPool
        import sys

        sys.getdefaultencoding()
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'}

        def towrite(contentdict):
            EmployData.objects.create(
                jobname=contentdict['0'],
                companyname=contentdict['1'],
                jobadr=contentdict['2'],
                releasetime=contentdict['3'],
                ctype=contentdict['4'],
                cscale=contentdict['5'],
                cindustry=contentdict['6'],
                csort=contentdict['7'],
                number=contentdict['8'],
                # description=contentdict['9'],
            )

        def spider(url):
            # print("get----------------------------")
            global jobname, companyname, jobadr, releasetime, ctype, cscale, cindustry, csort, number
            html = requests.get(url, headers=headers)
            selector = etree.HTML(html.text)
            content_field = selector.xpath('//ul[@class = "searchResultListUl"]/li')
            item = {}
            for each in content_field:
                try:
                    jobname = \
                    each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultJobName"]/a/text()')[0]
                    companyname = each.xpath(
                        'div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyname"]/span/text()')[0]
                    jobadr = each.xpath(
                        'div[@class="searchResultItemDetailed"]/p[@class="searchResultJobAdrNum"]/span/span/em/text()')[0]
                    releasetime = each.xpath(
                        'div[@class="searchResultItemDetailed"]/p[@class="searchResultJobAdrNum"]/span/span/em/text()')[1]
                    ctype = each.xpath(
                        'div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[
                        0]
                    cscale = each.xpath(
                        'div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[
                        1]
                    cindustry = each.xpath(
                        'div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[
                        2]
                    csort = each.xpath(
                        'div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[
                        3]
                    number = each.xpath(
                        'div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[
                        4]

                    # description = \
                    # each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultJobdescription"]/span/text()')[
                    #     0]
                except IndexError:
                    pass

                item['0'] = jobname if jobname else "未知"
                item['1'] = companyname if companyname else "未知"
                item['2'] = jobadr if jobadr else "未知"
                item['3'] = releasetime if releasetime else "未知"
                item['4'] = ctype if ctype else "未知"
                item['5'] = cscale if cscale else "未知"
                item['6'] = cindustry if cindustry else "未知"
                item['7'] = csort if csort else "未知"
                item['8'] = number if number else "未知"
                # item['9'] = description

                towrite(item)


        time1 = time.time()
        pool = ThreadPool(8)
        page = []
        for i in range(1, 1906):
            url_ = "https://xiaoyuan.zhaopin.com/full/0/0_0_0_0_0_-1_0_"
            _url = "_0"
            newpage = url_ + str(i) + _url
            page.append(newpage)

        results = pool.map(spider, page)
        pool.close()
        pool.join()
        time2 = time.time()
        totletime = time2 - time1
        return HttpResponse(totletime)










# Create your views here.
