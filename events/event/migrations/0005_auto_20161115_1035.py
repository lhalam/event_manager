# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-15 08:35
from __future__ import unicode_literals

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0004_auto_20161101_2217'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='place',
            field=models.CharField(max_length=200, null=True),
        ),
        migrations.AlterField(
            model_name='event',
            name='location',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.FloatField(), size=2),
        ),
    ]