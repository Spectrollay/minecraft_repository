/*
 * Copyright © 2020. Spectrollay
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const projectDir = path.resolve('./'); // 项目根目录
const outputPath = './Verification/file-hashes.json'; // 哈希值文件输出路径
const projectHashPath = './Verification/project-hash.json'; // 项目哈希值文件路径

const excluded = [
    '.git\\',
    '.github\\',
    '.idea\\',
    'data\\',
    'deprecated_features\\',
    'experiments_internal\\',
    'Feed\\',
    'Verification\\',
    '!important',
    '.gitignore',
    'README.md',
    'README-en_US.md',
];

// 计算文件的MD5哈希值
function calculateHash(filePath) {
    const hash = crypto.createHash('md5');
    const fileContent = fs.readFileSync(filePath);
    hash.update(fileContent);
    return hash.digest('hex');
}

// 判断文件路径是否在排除列表中
function isExcluded(filePath) {
    const relativePath = path.relative(projectDir, filePath);
    return excluded.some(exclude => relativePath.includes(exclude));
}

// 获取目录下所有文件
function getAllFiles(dirPath, filesList = []) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // 递归获取目录中的文件,跳过排除列表中的目录
            if (!isExcluded(fullPath)) {
                getAllFiles(fullPath, filesList);
            }
        } else {
            // 将文件添加到文件列表中,跳过排除列表中的文件
            if (!isExcluded(fullPath)) {
                filesList.push(fullPath);
            }
        }
    });
    return filesList;
}

// 生成文件哈希值并保存到JSON文件中
function generateFileHashes() {
    const allFiles = getAllFiles(projectDir);
    const hashList = {};

    allFiles.forEach(file => {
        hashList[path.relative(projectDir, file)] = calculateHash(file);
    });

    fs.writeFileSync(outputPath, JSON.stringify(hashList, null, 2), 'utf-8');
    console.log(`哈希值已保存至 ${outputPath}`);

    // 计算file-hashes.json的哈希值
    const projectHash = calculateHash(outputPath);
    fs.writeFileSync(projectHashPath, JSON.stringify({projectHash}, null, 2), 'utf-8');
    console.log(`项目哈希值已保存至 ${projectHashPath}`);
}

// 执行生成哈希值的函数
generateFileHashes();
