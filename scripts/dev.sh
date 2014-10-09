#!/bin/bash

cd `dirname $0`
supervisor ../server/app.js
