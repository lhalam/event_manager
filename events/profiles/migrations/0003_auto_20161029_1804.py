# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-10-29 15:04
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0002_auto_20161029_1752'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='photo',
            field=models.CharField(default='default_photo.png', max_length=200),
        ),
    ]
