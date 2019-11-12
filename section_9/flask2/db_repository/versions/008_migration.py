from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
to_do_list = Table('to_do_list', pre_meta,
    Column('id', INTEGER, primary_key=True, nullable=False),
    Column('task_name', VARCHAR(length=30)),
    Column('content', VARCHAR(length=255)),
    Column('create_time', VARCHAR(length=255)),
    Column('deadline', VARCHAR(length=255)),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['to_do_list'].drop()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['to_do_list'].create()
