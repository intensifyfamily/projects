from sqlalchemy import *
from migrate import *


from migrate.changeset import schema
pre_meta = MetaData()
post_meta = MetaData()
tasks = Table('tasks', pre_meta,
    Column('id', INTEGER, primary_key=True, nullable=False),
    Column('task_name', VARCHAR(length=20)),
    Column('content', VARCHAR(length=250)),
    Column('create_time', VARCHAR(length=250)),
    Column('deadline', VARCHAR(length=250)),
    Column('status', VARCHAR(length=20)),
    Column('principal', VARCHAR(length=20)),
    Column('email', VARCHAR(length=250)),
)


def upgrade(migrate_engine):
    # Upgrade operations go here. Don't create your own engine; bind
    # migrate_engine to your metadata
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['tasks'].drop()


def downgrade(migrate_engine):
    # Operations to reverse the above upgrade go here.
    pre_meta.bind = migrate_engine
    post_meta.bind = migrate_engine
    pre_meta.tables['tasks'].create()
