# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-12-29 08:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0004_auto_20161219_2138'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='education',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='job',
            field=models.CharField(blank=True, max_length=200),
        ),
    ]
