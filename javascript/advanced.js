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

rootPath = '/' + (window.location.pathname.split('/').filter(Boolean).length > 0 ? window.location.pathname.split('/').filter(Boolean)[0] : '');

// 点击Debug图标事件
function debugPage() {
    ifNavigating('jump', rootPath + '/advanced/debug.html');
}

// 点击环境指南按钮
function enviPage() {
    ifNavigating('jump', rootPath + '/guidance/environment_guidance.html');
}

// 捐赠专享
const limitedSwitch = document.getElementById('limited_access_modal');

if (limitedSwitch) {
    limitedSwitch.beforeToggle = function () {
        return localStorage.getItem('donate') === 'true';
    };

    limitedSwitch.addEventListener('switch-toggle-blocked', function () {
        showModal('donor_only_modal');
    });
}

// 清除存储
function clearStorage() {
    const keyPatterns = [`(${rootPath}/)`, 'minecraft_repository_attribute'];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (keyPatterns.some(pattern => key.includes(pattern))) {
            localStorage.removeItem(key);
            i--;
        }
    }
    sessionStorage.clear();
    logManager.log("清除存储数据成功");
    mainPage();
}

// 重置全部
function resetAll() {
    localStorage.clear();
    sessionStorage.clear();
    logManager.log("重置全部内容成功");
    mainPage();
}

// 重载页面
function clearAndReload() {
    sessionStorage.clear();
    location.reload();
    logManager.log("重载容器环境成功");
}

const versionBlock = document.getElementById('version_block');
const developerBlock = document.getElementById('developer_block');
let clickCount = 0;
let clickTimer;

// 快速连点处理函数
function handleClick(event, conditionKey, successMessage, callback) {
    if (sessionStorage.getItem(conditionKey) === 'true') {
        logManager.log("已解锁!");
        return;
    }

    if (!event.target.closest('custom-button')) {
        clickCount++;
        logManager.log("连续点击次数: " + clickCount);

        if (clickCount === 1) { // 第一次点击时启动计时器
            clickTimer = setTimeout(() => {
                clickCount = 0; // 重置计数器
            }, 1000); // 点击时间间隔
        }

        if (clickCount === 6) {
            clearTimeout(clickTimer); // 清除计时器
            clickCount = 0; // 重置计数器
            sessionStorage.setItem(conditionKey, 'true'); // 设置临时存储

            logManager.log(successMessage);
            if (callback) callback(); // 执行自定义逻辑
        }
    }
}

// 检查是否显示
if (sessionStorage.getItem('enableDebug') === 'true') {
    const debug = document.querySelectorAll('#debug, .debug_mode, .clear_all');
    if (debug) {
        debug.forEach(item => {
            item.style.display = 'flex';
        })
    }
}

if (sessionStorage.getItem('showTheEnd') === 'true') {
    const theEnd = document.getElementById('the_end');
    if (theEnd) {
        theEnd.style.display = 'flex';
    }
}

// 添加事件监听
if (versionBlock) {
    versionBlock.addEventListener('click', (event) => {
        handleClick(event, 'enableDebug', '解锁调试模式!', () => {
            const debug = document.querySelectorAll('#debug, .debug_mode, .clear_all');
            if (debug) {
                debug.forEach(item => {
                    item.style.display = 'flex';
                })
            }
            mainHandleScroll(); // 联动自定义网页滚动条
        });
    });
}

if (developerBlock) {
    developerBlock.addEventListener('click', (event) => {
        handleClick(event, 'showTheEnd', '发现了彩蛋!', () => {
            document.getElementById('the_end').style.display = 'flex';
            mainHandleScroll(); // 联动自定义网页滚动条
        });
    });
}

const checkInput = document.querySelector('#check_input text-field');

function checkContinue() {
    const inputValue = checkInput.getValue().trim(); // 获取并去除输入值的空格
    const requiredValue = '我知道我在做什么'; // 预期的文本
    const checkContinueBtn = document.getElementById('check_continue');
    const checkContinueFrame = checkContinueBtn.parentElement;

    // 比对输入值和预期文本
    if (inputValue === requiredValue) {
        if (checkContinueBtn) {
            checkContinueFrame.setAttribute('data', 'modal|red||check_continue|false||');
            checkContinueFrame.setAttribute('js', 'hideModal(this);document.getElementById(\'check_input\').querySelector(\'text-field\').resetValue();checkInputValue();resetAll();');
        }
    } else {
        if (checkContinueBtn) {
            checkContinueFrame.setAttribute('data', 'modal|disabled||check_continue|false||');
            checkContinueFrame.setAttribute('js', 'false');
        }
    }
}

if (checkInput) {
    checkInput.addEventListener('input', checkContinue);
}
