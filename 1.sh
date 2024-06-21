#!/bin/sh

# 如果没有提供参数，就使用默认的提交信息
if [ -z "$1" ]
then
  msg="修改"
else
  msg="$1"
fi

# 执行git命令
git add .
git commit -m "$msg"
git push
