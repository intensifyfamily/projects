import time
from lxml import etree
import requests
from multiprocessing.dummy import Pool as ThreadPool
import sys
from e_data.models import EmploymentData


sys.getdefaultencoding()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'}


def towrite(contentdict):
    EmploymentData.objects.create(
        jobname=contentdict['0'],
        companyname=contentdict['1'],
        jobadr=contentdict['2'],
        releasetime=contentdict['3'],
        ctype=contentdict['4'],
        cscale=contentdict['5'],
        cindustry=contentdict['6'],
        csort=contentdict['7'],
        number=contentdict['8'],
        description=contentdict['9'],
    )


def spider(url):
    # print("get----------------------------")
    html = requests.get(url, headers=headers)
    selector = etree.HTML(html.text)
    content_field = selector.xpath('//ul[@class = "searchResultListUl"]/li')
    item = {}
    for each in content_field:
        jobname = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultJobName"]/a/text()')[0]
        companyname = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyname"]/span/text()')[0]
        jobadr = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultJobAdrNum"]/span/span/text()')[0]
        releasetime = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultJobAdrNum"]/span/span/text()')[1]
        ctype = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[0]
        cscale = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[1]
        cindustry = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[2]
        csort = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[3]
        number = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultCompanyInfodetailed"]/span/span/em/text()')[4]
        description = each.xpath('div[@class="searchResultItemDetailed"]/p[@class="searchResultJobdescription"]/text()')[0]

        item['0'] = jobname
        item['1'] = companyname
        item['2'] = jobadr
        item['3'] = releasetime
        item['4'] = ctype
        item['5'] = cscale
        item['6'] = cindustry
        item['7'] = csort
        item['8'] = number
        item['9'] = description

        towrite(item)


if __name__ == '__main__':
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
    totletime = time2-time1
    print(totletime)

# html = requests.get("http://tu.duowan.com/tu",headers = headers)
# def getsource(url):
#     html = requests.get(url,headers = headers)
# urls = []
# for i in range(1,11):
#     newpage = 'https://tieba.baidu.com/p/6117888348?pn=' + str(i)
#     urls.append(newpage)
#
#
# print("多线程开始——————————————————")
# pool = ThreadPool(8)
# time3 = time.time()
# results = pool.map(getsource,urls)
# pool.close()
# pool.join()
# time4 = time.time()
# print("并行耗时：" + str(time4-time3))
