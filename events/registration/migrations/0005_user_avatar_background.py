# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-12-15 09:58
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0004_merge_20161215_1155'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar_background',
            field=models.CharField(default='#2980b9', max_length=7),
            preserve_default=False,
        ),
    ]
