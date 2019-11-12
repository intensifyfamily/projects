from django.urls import path
from . import views
from django.contrib import admin


app_name = 'e_data'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',views.index,name='index'),
    path('login/',views.login,name='login'),
    path('signup/',views.signup,name='signup'),
    path('spider/',views.spiderdata,name='spider'),
]
