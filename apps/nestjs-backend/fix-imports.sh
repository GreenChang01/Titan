#!/bin/bash

# 批量修复导入扩展名问题的脚本

# 找到所有需要修复的TypeScript文件
files=$(find src -name "*.ts" -not -path "*/test/*" -not -path "*/tests/*")

# 遍历每个文件，添加.js扩展名到相对导入
for file in $files; do
    # 使用sed替换相对导入，添加.js扩展名
    # 匹配 from '../xxx' 和 from './xxx' 模式，但避免已经有扩展名的
    sed -i '' \
        -e "s/from '\.\.\([^']*\)'/from '..\1.js'/g" \
        -e "s/from '\.\([^']*\)'/from '.\1.js'/g" \
        "$file"
    
    # 修复可能产生的双重扩展名问题
    sed -i '' \
        -e "s/\.js\.js'/.js'/g" \
        -e "s/\.ts\.js'/.js'/g" \
        "$file"
done

echo "导入扩展名修复完成"