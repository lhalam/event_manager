# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-14 21:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0005_merge_20161114_2355'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='created_date',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
