# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-06 16:01
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0002_auto_20161106_1756'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='hobby',
        ),
    ]
