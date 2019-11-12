from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
to_do_list = Table('to_do_list', post_meta,
    Column('id', Integer, primary_key=True, nullable=False),
    Column('task_name', String(length=30)),
    Column('content', String(length=255)),
    Column('create_time', String(length=255)),
    Column('deadline', String(length=255)),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['to_do_list'].create()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    post_meta.tables['to_do_list'].drop()
