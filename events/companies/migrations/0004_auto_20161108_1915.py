# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-11-08 17:15
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('companies', '0003_auto_20161108_1748'),
    ]

    operations = [
        migrations.RenameField(
            model_name='company',
            old_name='company_admin',
            new_name='admin',
        ),
    ]