from django.contrib import admin

from .models import EmployData,AuthUserLog


@admin.register(AuthUserLog)
class AuthUserLogAdmin(admin.ModelAdmin):
    # listdisplay设置要显示在列表中的字段（id字段是Django模型的默认主键）
    list_display = ('id','userid', 'username', 'addtime')

    # list_per_page设置每页显示多少条记录，默认是100条
    list_per_page = 50

    # ordering设置默认排序字段，负号表示降序排序
    ordering = ('-id',)

    # list_editable 设置默认可编辑字段
    # list_editable = ['jobadr','releasetime']
    # 设置哪些字段可以点击进入编辑界面
    list_display_links = ('username',)

    date_hierarchy = 'addtime'  # 详细时间分层筛选

    # # fk_fields 设置显示外键字段
    # fk_fields = ('addtime',)
# Register your models here.
# Blog模型的管理器
@admin.register(EmployData)
class EmployDataAdmin(admin.ModelAdmin):
    # listdisplay设置要显示在列表中的字段（id字段是Django模型的默认主键）
    list_display = ('id','jobname', 'companyname', 'jobadr', 'releasetime', 'ctype', 'cscale', 'cindustry', 'csort', 'number')

    # list_per_page设置每页显示多少条记录，默认是100条
    list_per_page = 50

    # ordering设置默认排序字段，负号表示降序排序
    ordering = ('id',)

    # list_editable 设置默认可编辑字段
    # list_editable = ['jobadr','releasetime']
    # 设置哪些字段可以点击进入编辑界面
    list_display_links = ('jobname','companyname')

    # fk_fields 设置显示外键字段
    fk_fields = ('ctype',)
# Register your models here.
