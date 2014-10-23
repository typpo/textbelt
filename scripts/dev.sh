#!/bin/bash
# Starts development server

cd `dirname $0`
supervisor ../server/app.js
