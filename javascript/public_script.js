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

// 路径检测
const currentURL = window.location.href;
const currentPagePath = window.location.pathname;
let hostPath = window.location.origin;
const parts = currentPagePath.split('/').filter(Boolean);
let rootPath = '/' + (parts.length > 0 ? parts[0] : '');
const slashCount = (currentPagePath.match(/\//g) || []).length;

// 日志管理器
window.logManager = {
    log: function (message, level = 'info') {
        const isLocalEnv = hostPath.includes('localhost') || rootPath.includes('_test');
        const formattedMessage = `[${level.toUpperCase()}]: ${message}`;
        const logFunction = console[level] || console.log;
        if (level === 'error') {
            logFunction.call(console, formattedMessage);
            console.trace(); // 输出堆栈追踪
        } else if (isLocalEnv) {
            logFunction.call(console, formattedMessage);
            console.trace(); // 在测试和开发环境中也输出
        }
    }
};

// 检测浏览器是否处于夜间模式
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('no-dark-mode'); // 覆盖夜间模式下的样式
}

// 响应式设计动画
document.addEventListener('DOMContentLoaded', function () {
    const mainScrollView = document.querySelector('.main_scroll_view.with_sidebar');
    if (mainScrollView) {
        window.addEventListener('resize', function () {
            mainScrollView.classList.add('animate');
        });
    }
});

// 节流函数,防止事件频繁触发
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = new Date().getTime();
        if (now - lastCall < delay) return;
        lastCall = now;
        return func(...args);
    };
}

// 点击顶栏回到顶部
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.header_logo').addEventListener('click', scrollToTop);
});

// 自动清除存储
let firstVisit = localStorage.getItem(`(${rootPath}/)firstVisit`);
if (firstVisit < '2024-05-25') { // NOTE 只在涉及到不兼容改变时更新
    clearStorage();
}

// 跳转判定
let isNavigating = false;

function ifNavigating(way, url) {
    if (isNavigating) {
        return; // 防止重复点击
    }
    isNavigating = true; // 设置状态,正在跳转
    if (way === 'direct') {
        window.location.href = url;
    } else if (way === 'open') {
        setTimeout(function () {
            window.open(url);
            setTimeout(function () {
                isNavigating = false; // 重置状态,允许下一次点击
            }, 100);
        }, 100);
    } else if (way === 'delayed_open') {
        setTimeout(function () {
            window.open(url);
            setTimeout(function () {
                isNavigating = false; // 重置状态,允许下一次点击
            }, 100);
        }, 1500);
    } else if (way === 'jump') {
        setTimeout(function () {
            window.location.href = url;
            setTimeout(function () {
                isNavigating = false; // 重置状态,允许下一次点击
            }, 100);
        }, 600);
    }
}

// 重载页面
function reloadPage() {
    let refreshCount = parseInt(localStorage.getItem(`(${rootPath}/)refreshTimes`) || '0');
    refreshCount++;
    localStorage.setItem(`(${rootPath}/)refreshTimes`, refreshCount.toString());
    setTimeout(function () {
        location.reload();
    }, 600);
}

logManager.log("浏览器UA: " + navigator.userAgent)
logManager.log("完整路径: " + currentURL);
logManager.log("来源: " + hostPath);
logManager.log("根路径: " + rootPath);
logManager.log("当前路径: " + currentPagePath);
logManager.log("当前位于" + (slashCount - 1) + "级页面");

if (hostPath.includes('file:///')) {
    logManager.log("当前运行在本地文件");
} else if (hostPath.includes('localhost')) {
    logManager.log("当前运行在本地服务器");
} else {
    logManager.log("当前运行在" + hostPath);
    // 禁用右键菜单
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    });
    // 禁用长按菜单
    document.addEventListener('touchstart', function (event) {
        event.preventDefault();
    });
}
if (rootPath.includes('_test')) {
    document.body.classList.add('test');
    logManager.log("当前为开发环境");
} else {
    logManager.log("当前为发布环境");
}

// 输出错误日志
window.addEventListener('error', function (event) {
    logManager.log("错误: " + event.message, 'error');
});

document.addEventListener('DOMContentLoaded', function () {
    logManager.log("页面加载完成!");
});

const startTime = new Date().getTime();
window.addEventListener('load', function () {
    const endTime = new Date().getTime();
    let loadTime = endTime - startTime;
    logManager.log("页面加载耗时: " + loadTime + "ms");
});

// 页面加载时缓存音效文件
const cacheName = 'audio-cache';
window.onload = async function () {
    if ('caches' in window) {
        try {
            const cache = await caches.open(cacheName);
            await cache.addAll([soundPaths['click'], soundPaths['button'], soundPaths['open'], soundPaths['close']]);
            logManager.log("音效文件已缓存!");
        } catch (error) {
            logManager.log("音效文件缓存失败: " + error, 'error');
        }
    }
};

async function getCachedAudio(filePath) {
    if ('caches' in window) {
        try {
            const cache = await caches.open(cacheName);
            const response = await cache.match(filePath);
            if (response) {
                const blob = await response.blob();
                const audioURL = URL.createObjectURL(blob);
                logManager.log("从缓存获取音效文件");
                return new Audio(audioURL); // 返回缓存中的音效
            } else {
                logManager.log("缓存中未找到音效文件,尝试直接从链接加载");
            }
        } catch (error) {
            logManager.log("从缓存获取音效文件失败: " + error, 'error');
        }
    } else {
        logManager.log("浏览器不支持缓存API,直接加载音效");
    }
    // 如果缓存获取失败直接返回网络资源
    return new Audio(filePath);
}

// 仓库提示弹窗
if (rootPath.includes('_test') && !localStorage.getItem('minecraft_repository_attribute')) {
    localStorage.setItem('minecraft_repository_attribute', 'test=true');
} else if (!rootPath.includes('_test') && !localStorage.getItem('minecraft_repository_attribute')) {
    localStorage.setItem('minecraft_repository_attribute', 'test=false');
}

if (currentPagePath === '/minecraft_repository/' || currentPagePath === '/minecraft_repository/index.html' || currentPagePath === '/minecraft_repository/index_new.html') { // TODO 在测试结束后移除
    if (rootPath.includes('_test')) {
        const neverShowIn15Days = localStorage.getItem(`(${rootPath}/)neverShowIn15Days`);
        if (neverShowIn15Days) {
            const lastHideTime = new Date(parseInt(neverShowIn15Days, 10));
            const now = new Date();
            const diff = now - lastHideTime;
            const fifteenDays = 15 * 24 * 60 * 60 * 1000; // 15天
            if (diff > fifteenDays) {
                localStorage.removeItem(`(${rootPath}/)neverShowIn15Days`);
            } else {
                logManager.log("时间未到,不显示开发仓库提示");
            }
        } else {
            const modal = document.getElementById('alert_modal');
            modal.innerHTML = `
                <modal>
                    <modal_title_area>
                        <modal_title>开发仓库提示</modal_title>
                        <modal_close_btn class="close_btn" onclick="hideModal(this);">
                            <img alt="" class="modal_close_btn_img" src="${rootPath}/images/cross_white.png"/>
                        </modal_close_btn>
                    </modal_title_area>
                    <modal_content class="main_page_alert">
                        <div>
                            <p>你正在使用的是开发仓库, 在继续之前, 你需要了解以下内容: </p>
                            <article_list>开发仓库可能包含部分未完成的功能和各种已知或未知的错误, 我们鼓励你在发现问题时及时提供反馈, 帮助我们进行改进.</article_list>
                            <article_list>开发仓库可能包含部分未启用的或处于实验阶段的功能, 这些功能可能会在后续的版本发生变动, 请不要过度依赖于这些功能.</article_list>
                            <article_list>开发仓库发布的均为快速迭代版本, 更新频率较高, 请加入版本库官方 <a href='https://t.me/spectrollay_minecraft_repository' onclick=\"playSound('click');\" target='_blank'>Telegram频道</a> 或 <a href='https://pd.qq.com/s/h8a7gt2u4' onclick=\"playSound('click');\" target='_blank'>QQ频道</a> 获取开发动态及最新消息推送.</article_list>
                            <article_list>如果你在使用过程中想要退出测试, 可以前往设置页面选择"退出测试"以重定向至发布仓库. 后续你还可以通过邀测重新加入测试.</article_list>
                            <p>如果你不能承受内测带来的风险且不同意上述内容, 请选择返回发布仓库.</p>
                        </div>
                    </modal_content>
                    <modal_checkbox_area>
                        <custom-checkbox active="off" id="neverShowIn15Days" status="enabled"></custom-checkbox>15天之内不再提示</modal_checkbox_area>
                    <modal_button_area>
                        <modal_button_group>
                            <modal_button_list>
                                <custom-button data="modal|green|||false||" js="leaveTest();hideAlertModal(this);" text="返回发布仓库"></custom-button>
                                <custom-button data="modal|disabled||continue_test_btn|false||" js="hideAlertModal(this);" text="继续"></custom-button>
                            </modal_button_list>
                        </modal_button_group>
                    </modal_button_area>
                </modal>`;
            showAlertModal();
            logManager.log("开发环境,显示开发仓库提示");
        }
        logManager.log("开发环境,不显示内测邀请");
    } else {
        const randomValue = Math.random();
        if (randomValue < 0.02) {
            const modal = document.getElementById('alert_modal');
            modal.innerHTML = `
                <modal>
                    <modal_title_area>
                        <modal_title>内部测试邀请</modal_title>
                        <modal_close_btn class="close_btn" onclick="hideModal(this);">
                            <img alt="" class="modal_close_btn_img" src="${rootPath}/images/cross_white.png"/>
                        </modal_close_btn>
                    </modal_title_area>
                    <modal_content class="main_page_alert">
                        <div>
                            <p>哇哦! 祝贺你被选中参加测试, 成为小部分可以抢先体验新版本的用户! 这里有一些你需要了解的内容: </p>
                            <article_list>请加入版本库官方频道以获取开发动态及最新消息推送:  <a href='https://t.me/spectrollay_minecraft_repository' onclick=\"playSound('click');\" target='_blank'>Telegram频道</a> / <a href='https://pd.qq.com/s/h8a7gt2u4' onclick=\"playSound('click');\" target='_blank'>QQ频道</a></article_list>
                            <article_list>加入测试后你将无法访问发布仓库, 直到你选择退出测试. 访问发布仓库将会被重定向至开发仓库.</article_list>
                            <article_list>不同于发布仓库, 开发仓库并不稳定, 可能存在部分问题以及正在测试的内容. 因此我们需要你在发现问题或有想法时及时向我们反馈.</article_list>
                            <article_list>悄悄地说一句, 积极参与内测可能会有奖励哦.</article_list>
                            <p>如果你可以承受内测带来的风险并同意上述内容, 请选择加入测试, 否则请取消.</p>
                        </div>
                    </modal_content>
                    <modal_button_area>
                        <modal_button_group>
                            <modal_button_list>
                                <custom-button data="modal|normal|||false||" js="hideAlertModal(this);" text="取消"></custom-button>
                                <custom-button data="modal|disabled||join_test_btn|false||" js="hideAlertModal(this);joinTest();" text="加入测试"></custom-button>
                            </modal_button_list>
                        </modal_button_group>
                    </modal_button_area>
                </modal>`;
            showAlertModal();
            logManager.log("显示内测邀请");
        }
        logManager.log("正式环境,不显示开发仓库提示");
    }

    window.addEventListener('load', function () {
        setTimeout(function () {
            let joinTestBtn, continueTestBtn, joinTestFrame, continueTestFrame;
            joinTestBtn = document.getElementById('join_test_btn');
            continueTestBtn = document.getElementById('continue_test_btn');
            if (joinTestBtn) {
                joinTestFrame = joinTestBtn.parentElement;
                startCountdown(joinTestBtn, joinTestFrame.getAttribute('text'), 10); // 10秒后可点击
            }
            if (continueTestBtn) {
                continueTestFrame = continueTestBtn.parentElement;
                startCountdown(continueTestBtn, continueTestFrame.getAttribute('text'), 10); // 10秒后可点击
            }

            function startCountdown(button, initialText, countdownTime) {
                let remainingTime = countdownTime;
                if (joinTestBtn) {
                    joinTestFrame.setAttribute('data', 'modal|disabled||join_test_btn|false||');
                    joinTestFrame.setAttribute('js', 'false');
                    joinTestFrame.setAttribute('text', `${initialText}(${remainingTime}s)`);
                } else if (continueTestBtn) {
                    continueTestFrame.setAttribute('data', 'modal|disabled||continue_test_btn|false||');
                    continueTestFrame.setAttribute('js', 'false');
                    continueTestFrame.setAttribute('text', `${initialText}(${remainingTime}s)`);
                }

                const countdownInterval = setInterval(() => {
                    remainingTime -= 1;
                    if (joinTestBtn) {
                        joinTestFrame.setAttribute('text', `${initialText}(${remainingTime}s)`); // 按钮倒计时
                    } else if (continueTestBtn) {
                        continueTestFrame.setAttribute('text', `${initialText}(${remainingTime}s)`); // 按钮倒计时
                    }

                    if (remainingTime <= 0) {
                        clearInterval(countdownInterval);
                        if (joinTestBtn) {
                            joinTestFrame.setAttribute('data', 'modal|green||join_test_btn|false||');
                            joinTestFrame.setAttribute('js', 'hideAlertModal(this);joinTest();');
                            joinTestFrame.setAttribute('text', `${initialText}`);
                        } else if (continueTestBtn) {
                            continueTestFrame.setAttribute('data', 'modal|normal||continue_test_btn|false||');
                            continueTestFrame.setAttribute('js', 'hideAlertModal(this);');
                            continueTestFrame.setAttribute('text', `${initialText}`);
                        }
                    }
                }, 1000);
            }
        }, 10);
    });

    function showAlertModal() {
        const overlay = document.getElementById('overlay_alert_modal');
        const modal = document.getElementById('alert_modal');
        overlay.style.display = 'block';
        modal.style.display = 'block';
        modal.focus();
        logManager.log("显示提示弹窗");
    }

    function hideAlertModal(button) {
        const overlay = document.getElementById('overlay_alert_modal');
        const modal = document.getElementById('alert_modal');
        playSoundType(button);
        overlay.style.display = 'none';
        modal.style.display = 'none';
        logManager.log("关闭提示弹窗");
    }
}

function joinTest() {
    localStorage.setItem('minecraft_repository_attribute', 'test=true');
    ifNavigating('jump', hostPath + '/minecraft_repository_test');
}

function leaveTest() {
    localStorage.setItem('minecraft_repository_attribute', 'test=false');
    localStorage.removeItem(`(${rootPath}/)neverShowIn15Days`);
    ifNavigating('jump', hostPath + '/minecraft_repository');
}

// 检查是否捐赠
function checkIfDonate(type, para) {
    const ifDonate = localStorage.getItem('donate') === 'true';
    console.log(ifDonate);
    if (ifDonate === true) {
        if (type === 'url') {
            ifNavigating('open', para)
        } else if (type === 'fun') {
            try {
                eval(para);
            } catch (error) {
                logManager.log(`执行函数时出错: ${error.message}`, 'error');
            }
        }
    } else {
        showModal('donor_only_modal');
    }
}

// 捐赠专享
const donorOnlyModal = `
    <div class="overlay normal_overlay" id="overlay_donor_only_modal"></div>
    <modal_area class="normal_modal" id="donor_only_modal" style="display: none;">
        <modal>
            <modal_title_area>
                <modal_title><img alt="" class="small_icon" src="./images/Crown.png"/>捐赠专享</modal_title>
                <modal_close_btn class="close_btn" onclick="hideModal(this);">
                    <img alt="" class="modal_close_btn_img" src="${rootPath}/images/cross_white.png"/>
                </modal_close_btn>
            </modal_title_area>
            <modal_content>
                <p>此功能为捐赠用户专享.<br>请前往捐赠页面解锁或了解更多信息.</p>
            </modal_content>
            <modal_button_area>
                <modal_button_group>
                    <modal_button_list>
                        <custom-button data="modal|green|||false||" js="hideModal(this);jumpToPage('./about/donate.html');" text="前往捐赠"></custom-button>
                        <custom-button data="modal|red|||false||" js="hideModal(this);" text="以后再说"></custom-button>
                    </modal_button_list>
                </modal_button_group>
            </modal_button_area>
        </modal>
    </modal_area>`;

document.body.insertAdjacentHTML('afterbegin', donorOnlyModal);

// 兼容性检测
const compatibilityModal = `
    <div class="overlay" id="overlay_compatibility_modal"></div>
    <modal_area id="compatibility_modal" style="display: none;">
        <modal>
            <modal_title_area>
                <modal_title>兼容性提示</modal_title>
            </modal_title_area>
            <modal_content>
                    <p>由于不同平台的代码支持存在些许差异, 为确保你的使用体验, 我们推荐通过以下浏览器及内核的最新发行版访问本站以获得完全的特性支持</p>
                    <p>浏览器: Edge / Chrome / Safari / Firefox<br/>内核: Chromium / Android WebView / Apple WebKit</p>
                    <p>在不支持或过旧的浏览器及内核上访问本站可能会出现错乱甚至崩溃问题</p>
            </modal_content>
            <modal_button_area>
                <modal_button_group>
                    <modal_button_list>
                        <custom-button data="modal|red|||false||" js="neverShowCompatibilityModalAgain(this);" text="不再显示"></custom-button>
                        <custom-button data="modal|green|||false||" js="hideCompatibilityModal(this);" text="我知道了"></custom-button>
                    </modal_button_list>
                </modal_button_group>
            </modal_button_area>
        </modal>
    </modal_area>`;

// document.body.insertAdjacentHTML('afterbegin', compatibilityModal);

// window.addEventListener('load', () => setTimeout(function () {
//     if (localStorage.getItem(`(${rootPath}/)neverShowCompatibilityModalAgain`) !== '1') {
//         const overlay = document.getElementById('overlay_compatibility_modal');
//         const modal = document.getElementById('compatibility_modal');
//         overlay.style.display = 'block';
//         modal.style.display = 'block';
//         modal.focus();
//         logManager.log("显示兼容性提示弹窗");
//     }
// }, 20)); // 页面加载完成后延时显示弹窗

function hideCompatibilityModal(button) {
    const overlay = document.getElementById('overlay_compatibility_modal');
    const modal = document.getElementById('compatibility_modal');
    playSoundType(button);
    overlay.style.display = 'none';
    modal.style.display = 'none';
    logManager.log("关闭兼容性提示弹窗");
}

function neverShowCompatibilityModalAgain(button) {
    hideCompatibilityModal(button);
    localStorage.setItem(`(${rootPath}/)neverShowCompatibilityModalAgain`, '1');
    logManager.log("关闭兼容性提示弹窗且不再提示");
}

// 访问受限提示
const today = new Date().toISOString().split('T')[0];
const firstVisitTodayModal = `
    <div class="overlay" id="overlay_first_visit_today_modal"></div>
    <modal_area id="first_visit_today_modal" style="display: none;">
        <modal>
            <modal_title_area>
                <modal_title>访问受限</modal_title>
            </modal_title_area>
            <modal_content>
                <p>新的一天请从版本库首页开始哦~</p>
            </modal_content>
            <modal_button_area>
                <modal_button_group>
                    <modal_button_list>
                        <custom-button data="modal|green|||false||" js="hideFirstVisitTodayModal(this);mainPage();" text="前往首页"></custom-button>
                    </modal_button_list>
                </modal_button_group>
            </modal_button_area>
        </modal>
    </modal_area>`;

document.body.insertAdjacentHTML('afterbegin', firstVisitTodayModal);

function checkFirstVisit() {
    firstVisit = localStorage.getItem(`(${rootPath}/)firstVisit`);
    const is404Page = document.title.includes('404 NOT FOUND');

    // 精确匹配的文件路径
    const allowedFiles = [
        `${rootPath}/`,
        `${rootPath}/index.html`,
        `${rootPath}/index_new.html`, // TODO 在完成新主页测试后移除
        `${rootPath}/home.html`,
        `${rootPath}/advanced/status.html`
    ];

    // 包含判断的文件夹路径
    const allowedFolders = [
        `${rootPath}/about/`,
        `${rootPath}/default/`,
        `${rootPath}/guidance/`,
        `${rootPath}/mcfc/`,
        `${rootPath}/mclang_cn/`,
        `${rootPath}/notifications/`,
        `${rootPath}/starcoin/`,
        `${rootPath}/Template/`,
        `${rootPath}/updatelog/`
    ];

    const currentPath = window.location.pathname;
    const isAllowedFile = allowedFiles.includes(currentPath);
    const isAllowedFolder = allowedFolders.some(folder => currentPath.startsWith(folder));
    const disableFirstVisitTodayModal = switchValues['limited_access_modal'] === 'off';

    if (firstVisit !== today && !isAllowedFile && !isAllowedFolder && !is404Page && !disableFirstVisitTodayModal) {
        const overlay = document.getElementById('overlay_first_visit_today_modal');
        const modal = document.getElementById('first_visit_today_modal');
        overlay.style.display = 'block';
        modal.style.display = 'block';
        modal.focus();
    }
}

if (window.location.pathname === `${rootPath}/` || window.location.pathname === `${rootPath}/index.html` || window.location.pathname === `${rootPath}/index_new.html`) { // TODO 在完成新主页测试后移除index_new.html
    localStorage.setItem(`(${rootPath}/)firstVisit`, today);
}

function hideFirstVisitTodayModal(button) {
    const overlay = document.getElementById('overlay_first_visit_today_modal');
    const modal = document.getElementById('first_visit_today_modal');
    playSoundType(button);
    overlay.style.display = 'none';
    modal.style.display = 'none';
}

window.addEventListener('load', () => setTimeout(function () {
    checkFirstVisit();
}, 20));

// 免责申明弹窗
function showDisclaimerModal(url) {
    const overlay = document.getElementById('overlay_disclaimer_modal');
    const modal = document.getElementById('disclaimer_modal');
    overlay.style.display = 'block';
    modal.style.display = 'block';
    logManager.log("显示免责声明弹窗");
    modal.dataset.openurl = url || ''; // 存储URL
    modal.focus();
}

function hideDisclaimerModal(button, state) {
    const overlay = document.getElementById('overlay_disclaimer_modal');
    const modal = document.getElementById('disclaimer_modal');
    const url = modal.dataset.openurl || null; // 取出存储的URL

    playSoundType(button);
    overlay.style.display = 'none';
    modal.style.display = 'none';

    if (url) {
        if (state === 1) {
            logManager.log("选择了同意并继续");
            ifNavigating('open', url);
            logManager.log("跳转成功");
        } else if (state === -1) {
            logManager.log("选择了不同意");
        }
    } else {
        logManager.log("未获取到跳转链接", 'warn');
    }

    logManager.log("关闭免责声明弹窗");
}

function howToBuyGame(button, state, url) {
    playSoundType(button);
    if (state === 0) {
        logManager.log("选择了正版购买指南");
    }
    logManager.log("获取到跳转链接: " + url);
    ifNavigating('jump', url);
    logManager.log("跳转成功");
}

// TODO 用户音量调节
let userVolume = 1;

const soundPaths = {
    click: rootPath + '/sounds/click.ogg',
    button: rootPath + '/sounds/button.ogg',
    pop: rootPath + '/sounds/pop.ogg',
    hide: rootPath + '/sounds/hide.ogg',
    open: rootPath + '/sounds/drawer_open.ogg',
    close: rootPath + '/sounds/drawer_close.ogg',
    toast: rootPath + '/sounds/toast.ogg'
};

function playSound(type) {
    const soundPath = soundPaths[type];
    if (!soundPath) {
        logManager.log(`未知的音效类型: ${type}`, 'error');
        return;
    }

    getCachedAudio(soundPath).then(audio => {
        audio.play().then(() => {
            logManager.log(`${type}音效播放成功!`);
        }).catch(error => {
            logManager.log(`${type}音效播放失败: ${error}`, 'error');
        });
    }).catch(error => {
        logManager.log(`获取${type}音效失败: ${error}`, 'error');
    });
}

// 按键音效
function playSoundType(button) {
    if (button.classList.contains('normal_btn') || button.classList.contains('red_btn') || button.classList.contains('sidebar_btn') || (button.classList.contains('tab_bar_btn') && button.classList.contains('no_active')) || button.classList.contains('close_btn') || button.classList.contains('header_item')) {
        playSound('click');
    } else if (button.classList.contains('green_btn')) {
        playSound('button');
    }
}

// 保存图片
function saveImage(button) {
    let parent = button.parentElement;
    while (parent && !parent.classList.contains('image_block')) {
        parent = parent.parentElement;
    }
    if (parent) {
        const image = parent.querySelector('.image_downloadable');
        const imageUrl = image.src;
        const fileName = decodeURIComponent(imageUrl.substring(imageUrl.lastIndexOf('/') + 1));
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName || 'downloaded_image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 点击菜单图标事件
function clickedMenu() {
    toggleSidebar();
    toggleOverlay();
}

function toUpdatelog() {
    const updatelogPath = rootPath + '/updatelog/';
    ifNavigating('jump', updatelogPath);
}

function toMessage() {
    const messagePath = rootPath + '/notifications/';
    ifNavigating('jump', messagePath);
}

function contact() {
    ifNavigating('jump', rootPath + '/about/contact.html');
}

// 重试按钮事件
function retry() {
    const params = new URLSearchParams(window.location.search);
    const source = params.get('source');

    if (source) {
        ifNavigating('jump', decodeURIComponent(source));
    } else {
        ifNavigating('jump', rootPath);
    }
}

// 点击返回按钮事件
function clickedBack() {
    logManager.log("点击返回");
    playSound('click');
    setTimeout(function () {
        if (window.history.length <= 1) {
            logManager.log("关闭窗口");
            window.close();
        } else {
            logManager.log("返回上一级页面");
            window.history.back();
        }
    }, 600);
}

// 点击仓库图标事件
function repoPage() {
    ifNavigating('open', 'https://github.com/Spectrollay/minecraft_repository/');
}

// 点击设置图标事件
function settingsPage() {
    ifNavigating('jump', rootPath + '/advanced/settings.html');
}

// 跳转主页
function mainPage() {
    ifNavigating('jump', rootPath);
}

// 跳转链接
function jumpToPage(link) {
    ifNavigating('jump', link);
}

// 打开网页
function openLink(url) {
    if (url.includes('mcarc.github.io')) { // TODO 在移除全部相关链接后删除判定
        ifNavigating('open', '/minecraft_repository/default/error_not-found.html');
    } else {
        ifNavigating('open', url);
    }
}

function delayedOpenLink(url) { // TODO 在页面完成迭代后移除
    setTimeout(function () {
        ifNavigating('open', url);
    }, 1500);
}

function launchApplication(deeplink) {
    window.location.assign(deeplink);
}

// 点击全屏遮罩事件
function clickedOverlay() {
    toggleSidebar();
    toggleOverlay();
}

// 点击侧边栏底部按钮事件
function clickedSidebarBottomBtn() {
    ifNavigating('open', 'https://github.com/Spectrollay/minecraft_kit');
}

// 滚动到网页顶部
function scrollToTop() {
    mainScrollContainer.scrollTo({
        top: 0, behavior: 'smooth'
    });
    console.log("成功执行回到顶部操作");
}

// 跳转到网页顶部
function toTop() {
    mainScrollContainer.scrollTo({
        top: 0, behavior: 'instant'
    });
}

// 复制文本
function copyText(text, type) {
    let display;
    if (type === 'text') {
        display = '文本';
    } else if (type === 'link') {
        display = '链接';
    } else {
        display = '内容';
    }

    navigator.clipboard.writeText(text).then(() => {
        showPop(`复制${display}成功!`, '', 'success');
        logManager.log("复制成功: " + text);
    }).catch(error => {
        showPop(`复制${display}失败!`, '', 'error');
        logManager.log("复制失败: " + error, 'error');
    });
}


// 切换标签栏
const tabContent = document.querySelector('.tab_content');
if (tabContent) {
    const defaultTabContent = document.querySelector('.tab_content.active');
    logManager.log("标签栏初始选中: " + defaultTabContent.id);
}

function selectTab(tabNumber) {
    const currentTabContent = document.querySelector('.tab_content.active');
    const selectedTabContent = document.getElementById('content' + tabNumber);
    const selectedSidebarContent = document.getElementById('sidebar_content' + tabNumber);
    logManager.log("标签栏当前选中: " + currentTabContent.id);
    logManager.log("标签栏交互选中: " + selectedTabContent.id);
    if (currentTabContent === selectedTabContent) { //选中一致
        logManager.log("点击了已选中标签");
    } else { // 选中不一致
        setTimeout(mainHandleScroll, 100); // 联动自定义网页滚动条

        // 切换标签栏选项卡
        document.querySelectorAll('.tab_bar_btn').forEach(button => {
            button.classList.remove('active');
            button.classList.add('no_active');
        });
        let tab_btn = document.getElementById(`tab${tabNumber}`);
        tab_btn.classList.add('active');
        tab_btn.classList.remove('no_active');
        logManager.log("切换标签");

        // 切换标签栏包含内容
        const tabContents = document.getElementsByClassName('tab_content');
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove('active');
            tabContents[i].classList.add('no_active');
        }
        selectedTabContent.classList.add('active');
        selectedTabContent.classList.remove('no_active');

        // 切换侧边栏包含内容
        const sidebarContents = document.getElementsByClassName('tab_sidebar');
        if (sidebarContents.length > 0) {
            for (let i = 0; i < sidebarContents.length; i++) {
                sidebarContents[i].classList.remove('active');
                sidebarContents[i].classList.add('no_active');
            }
            selectedSidebarContent.classList.add('active');
            selectedSidebarContent.classList.remove('no_active');
        }

        logManager.log("切换与标签相关的内容");
    }
}


// 侧边栏
let sidebarOpen = false;

function toggleSidebar() { // 切换侧边栏状态
    const sidebar = document.getElementById('sidebar');
    if (sidebarOpen) {
        playSound('close');
        sidebar.style.left = -sidebar.offsetWidth + 'px'; // 隐藏到屏幕左侧
        logManager.log("侧边栏执行收起操作");
    } else {
        playSound('open');
        sidebar.style.left = '0'; // 显示侧边栏
        logManager.log("侧边栏执行展开操作");
    }
    sidebarOpen = !sidebarOpen;
    logManager.log("更新侧边栏状态成功");
}

let overlayShow = false;

function toggleOverlay() { // 切换遮罩
    const overlay_main = document.getElementById('overlay_main');
    if (overlayShow) {
        overlay_main.style.display = 'none';
        logManager.log("遮罩成功隐藏");
    } else {
        overlay_main.style.display = 'block';
        logManager.log("遮罩成功显示");
    }
    overlayShow = !overlayShow;
    logManager.log("更新遮罩状态成功");
}


// 可展开卡片函数
const expandableCardGroup = document.getElementsByClassName('expandable_card_group');

function setCardState(expandableCard, expandableContent, cardImage, isExpanded) {
    expandableCard.classList.toggle('expanded', isExpanded);
    expandableCard.classList.toggle('no_expanded', !isExpanded);
    expandableContent.classList.toggle('expanded', isExpanded);
    expandableContent.classList.toggle('no_expanded', !isExpanded);
    expandableContent.style.height = isExpanded ? expandableContent.scrollHeight + 'px' : '0';
    cardImage.src = isExpanded ? '/minecraft_repository/images/arrowUp_white.png' : '/minecraft_repository/images/arrowDown_white.png';
}

function collapseOtherCards(expandableCardArea, currentIndex) {
    for (let k = 0; k < expandableCardArea.length; k++) {
        if (k !== currentIndex) {
            const otherCard = expandableCardArea[k].querySelector('.expandable_card');
            const otherContent = expandableCardArea[k].querySelector('.expandable_card_down_area');
            const otherCardImage = otherCard.querySelector('.expandable_card_image');
            setCardState(otherCard, otherContent, otherCardImage, false);
        }
    }
}

// 初始化所有卡片状态
function initializeCards() {
    for (let i = 0; i < expandableCardGroup.length; i++) {
        const expandableCardArea = expandableCardGroup[i].querySelectorAll('.expandable_card_area');
        for (let j = 0; j < expandableCardArea.length; j++) {
            const expandableCard = expandableCardArea[j].querySelector('.expandable_card');
            const expandableContent = expandableCardArea[j].querySelector('.expandable_card_down_area');
            const cardImage = expandableCard.querySelector('.expandable_card_image');
            let isExpanded = expandableCard.classList.contains('expanded');

            setCardState(expandableCard, expandableContent, cardImage, isExpanded);
            expandableCard.addEventListener('click', () => {
                isExpanded = expandableCard.classList.contains('expanded');
                if (isExpanded) {
                    setCardState(expandableCard, expandableContent, cardImage, false);
                } else {
                    collapseOtherCards(expandableCardArea, j);
                    setCardState(expandableCard, expandableContent, cardImage, true);
                }
                isExpanded = !isExpanded;
            });
        }
    }
}

// 处理窗口大小调整逻辑
function handleResize() {
    for (let i = 0; i < expandableCardGroup.length; i++) {
        const expandableCardArea = expandableCardGroup[i].querySelectorAll('.expandable_card_area');
        for (let j = 0; j < expandableCardArea.length; j++) {
            const expandableCard = expandableCardArea[j].querySelector('.expandable_card');
            const expandableContent = expandableCardArea[j].querySelector('.expandable_card_down_area');
            const cardDown = expandableContent.querySelector('.expandable_card_down');
            if (expandableCard.classList.contains('expanded')) {
                expandableContent.style.transition = 'height 0ms';
                expandableContent.style.height = cardDown.scrollHeight + 'px';
                setTimeout(() => {
                    expandableContent.style.transition = 'height 600ms';
                }, 0); // 延时防止调用失败
            }
        }
    }
}

// 页面加载完成后初始化卡片状态
window.addEventListener('load', () => {
    initializeCards();
    handleResize(); // 初始化时确保高度正确
});

// 监听窗口大小变化
window.addEventListener('resize', handleResize);


// 自适应折叠组件
const mainDiv = document.getElementById('main');
const allMessages = mainDiv.querySelectorAll('.message');
const threshold = 5; // 初始阈值
let currentThreshold = threshold; // 当前展开的阈值

// 隐藏超过阈值的消息
for (let i = threshold; i < allMessages.length; i++) {
    allMessages[i].style.display = 'none';
}

const foldingBtn = document.querySelector('.folding_custom_btn');

function updateButtonsVisibility() {
    setTimeout(function () {
        let showMoreBtn = document.getElementById('showMoreBtn');
        let showLessBtn = document.getElementById('showLessBtn');

        if (showMoreBtn) {
            let showMore = showMoreBtn.parentElement;
            if (allMessages.length > currentThreshold) {
                showMore.setAttribute('data', 'folding|green|small|showMoreBtn|false||');
            } else {
                showMore.setAttribute('data', 'folding|disabled|small|showMoreBtn|false||');
            }
        }
        if (showLessBtn) {
            let showLess = showLessBtn.parentElement;
            if (currentThreshold > threshold) {
                showLess.setAttribute('data', 'folding|normal|small|showLessBtn|false||');
            } else {
                showLess.setAttribute('data', 'folding|disabled|small|showLessBtn|false||');
            }
        }
    }, 10);
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    if (foldingBtn) {
        updateButtonsVisibility();
    }
});

function showMore() {
    const numToDisplay = Math.min(threshold, allMessages.length - currentThreshold);
    for (let i = currentThreshold; i < currentThreshold + numToDisplay; i++) {
        allMessages[i].style.display = 'block';
    }
    currentThreshold += numToDisplay;
    updateButtonsVisibility();
    mainHandleScroll(); // 联动自定义网页滚动条
    logManager.log("展开消息");
}

function showLess() {
    const numToHide = Math.min(threshold, currentThreshold - threshold);
    for (let i = currentThreshold - 1; i >= currentThreshold - numToHide; i--) {
        allMessages[i].style.display = 'none';
    }
    currentThreshold -= numToHide;
    updateButtonsVisibility();
    mainHandleScroll(); // 联动自定义网页滚动条
    logManager.log("收起消息");
}
