import smtplib
from email.mime.text import MIMEText

class mailhelper(object):
    def __init__(self):
        self.mail_host = 'smtp.yeah.net'
        self.mail_user = 'wszdhan@yeah.net'
        self.mail_pass = 'itang85'
        self.mail_postfix = 'yeah.net'
    def send_mail(self,to_list,sub,content):
        me = 'task_web'+'<'+self.mail_user+'@'+self.mail_postfix+'>'
        msg = MIMEText(content, _subtype='html', _charset='utf-8')
        msg['Subject'] = sub
        msg['From'] = me
        msg['To'] = ";".join(to_list)
        try:
            server = smtplib.SMTP()
            server.set_debuglevel(1)
            server.connect(self.mail_host)
            server.login(self.mail_user,self.mail_pass)
            server.sendmail(me,to_list,msg.as_string())
            server.close()
            return True
        except Exception as e:
            print(str(e))
            return False




