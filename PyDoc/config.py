import redis

class Config(object):
    '''工程配置文件'''

    SECRET_KEY = 'sadfsdfggwergvfcasdasfdfrhtrhtyjuy'
    DEBUG = True

    #mysql配置
    SQLALCHEMY_DATABASE_URL = 'mysql://'

    #redis配置
    REDIS_HOST = '127.0.0.1'
    REDIS_PORT = 8080

    SESSION_TYPE = 'redis'

    #加密
    SESSION_USE_SIGNER = True
    SESSION_REDIS = redis.StrictRedis()

class DevelopementConfig(Config):
    '''开发模式'''
    DEBUG = True


class produtionConding(Config):

    pass

config = {
    'developemen': DevelopementConfig,
    'prodution': produtionConding
}
