# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-08 15:48
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0002_auto_20161102_1716'),
    ]

    operations = [
        migrations.AlterField(
            model_name='company',
            name='description',
            field=models.TextField(blank=True, max_length=500, null=True),
        ),
    ]
