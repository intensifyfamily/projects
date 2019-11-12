# Generated by Django 2.2.3 on 2019-07-03 15:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('e_data', '0009_auto_20190703_2321'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmploymentData',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('jobname', models.CharField(max_length=254)),
                ('companyname', models.CharField(max_length=254)),
                ('jobadr', models.CharField(max_length=30)),
                ('releasetime', models.CharField(max_length=30)),
                ('ctype', models.CharField(max_length=30)),
                ('cscale', models.CharField(max_length=30)),
                ('cindustry', models.CharField(max_length=30)),
                ('csort', models.CharField(max_length=30)),
                ('number', models.CharField(max_length=30)),
            ],
            options={
                'db_table': 'employment_data',
                'managed': True,
            },
        ),
        migrations.DeleteModel(
            name='EmployData',
        ),
    ]