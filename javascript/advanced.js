/*
 * Copyright © 2020-2024. Spectrollay
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

// 跳转实验性页面
function flagsPage() {
    rootPath = '/' + (window.location.pathname.split('/').filter(Boolean).length > 0 ? window.location.pathname.split('/').filter(Boolean)[0] + '/' : '');
    setTimeout(function () {
        if (rootPath.includes('_test')) {
            window.location.href = "/minecraft_repository/experiments/flags.html";
        } else {
            window.location.href = "/minecraft_repository/flags/";
        }
    }, 600);
}

// 点击Debug图标事件
function debugPage() {
    setTimeout(function () {
        window.location.href = "/minecraft_repository/advanced/debug.html";
    }, 600);
}

// 清除存储
function clearStorage() {
    const keyPatterns = ["(/minecraft_repository/)", "minecraft_repository_attribute"];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (keyPatterns.some(pattern => key.includes(pattern))) {
            localStorage.removeItem(key);
            i--;
        }
    }
    sessionStorage.clear();
    console.log('清除存储数据成功');
    mainPage();
}

// 重载页面
function reloadPage() {
    sessionStorage.clear();
    location.reload();
    console.log('重载容器环境成功');
}
