# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-10-20 07:27
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='location',
            field=models.CharField(max_length=200, null=True),
        ),
]
