# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-10-28 18:41
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('registration', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='registrationconfirm',
            old_name='closed',
            new_name='is_closed',
        ),
    ]
