let sidebarOpen = false;
let overlayShow = false;

const startTime = new Date().getTime();
const audioInstances = [];
const main = document.getElementById("main");

// 检测浏览器是否处于夜间模式
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // 覆盖夜间模式下的样式
    document.body.classList.add('no-dark-mode');
}

const currentURL = window.location.href;
const currentPagePath = window.location.pathname;
const hostPath = window.location.origin;
const parts = currentPagePath.split('/').filter(Boolean);
const rootPath = '/' + (parts.length > 0 ? parts[0] + '/' : '');
const slashCount = (currentPagePath.match(/\//g) || []).length;

// 创建 link 元素
const public_style = document.createElement('link');
public_style.rel = 'stylesheet';
public_style.href = rootPath + 'stylesheet/public_style.css';

// 将 link 元素添加到 head 中
document.head.appendChild(public_style);

const soundClickPath = rootPath + 'sounds/click.ogg';
const soundButtonPath = rootPath + 'sounds/button.ogg';
const updatelogPath = rootPath + 'updatelog/';
const pageLevel = (slashCount - 1) + "级页面";

console.log("浏览器UA: ", navigator.userAgent)
console.log("完整路径: ", currentURL);
console.log("来源: ", hostPath);
console.log("根路径: ", rootPath);
console.log("当前路径: ", currentPagePath);

if (hostPath.includes('file:///')) {
    console.log('当前运行在本地文件');
} else if (hostPath.includes('localhost')) {
    console.log("当前运行在本地服务器");
} else if (hostPath.includes('github.io')) {
    console.log("当前运行在Github");
    // 禁用右键菜单
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    });
    // 禁用长按菜单
    document.addEventListener('touchstart', function (event) {
        event.preventDefault();
    });
} else if (hostPath.includes('gitee.io')) {
    console.log("当前运行在Gitee");
    // 禁用右键菜单
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    });
    // 禁用长按菜单
    document.addEventListener('touchstart', function (event) {
        event.preventDefault();
    });
} else {
    console.log("当前运行在" + hostPath);
}
if (rootPath.includes('test')) {
    console.log("环境为测试环境");
} else {
    console.log("环境为标准环境");
}

console.log("当前位于" + pageLevel);

// 禁止拖动元素
const images = document.querySelectorAll("img");
const links = document.querySelectorAll("a");
images.forEach(function (image) {
    image.draggable = false;
});

links.forEach(function (link) {
    link.draggable = false;
});

// 兼容性检测
const compatibilityModal = `
        <div id="compatibility_modal" class="modal_area">
            <div class="modal">
                <div class="modal_title">兼容性提示</div>
                <div class="modal_content">
                    <p>不同浏览器之间存在些许差异,为确保你的使用体验,我们推荐通过以下浏览器或内核的最新发行版访问本站以获得完全的特性支持:
                        Edge / Chrome / Firefox / Safari / WebView Android</p>
                </div>
                <div class="modal_btn_area">
                    <button class="btn red_btn modal_btn" onclick="neverShowCompatibilityModalAgain(this);">不再显示</button>
                    <button class="btn green_btn modal_btn" onclick="hideCompatibilityModal(this);">我知道了</button>
                </div>
            </div>
        </div>`;
document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem('neverShowCompatibilityModalAgain') || localStorage.getItem('neverShowCompatibilityModalAgain') !== '1') {
        const overlay = document.getElementById("overlay");
        const modal = document.getElementById("compatibility_modal");
        overlay.style.display = "block";
        modal.style.display = "block";
        console.log("显示兼容性提示弹窗");
    }
});

function hideCompatibilityModal(button) {
    const overlay = document.getElementById("overlay");
    const modal = document.getElementById("compatibility_modal");
    playSound(button);
    overlay.style.display = "none";
    modal.style.display = "none";
    console.log("关闭兼容性提示弹窗");
}

function neverShowCompatibilityModalAgain(button) {
    hideCompatibilityModal(button);
    localStorage.setItem('neverShowCompatibilityModalAgain', '1');
    console.log("关闭兼容性提示弹窗且不再提示");
}

document.body.insertAdjacentHTML('afterbegin', compatibilityModal);

// 输出错误日志
window.addEventListener("error", function (event) {
    console.error("错误: ", event.message);
});

document.addEventListener("DOMContentLoaded", function () {
    const click = new Audio(soundClickPath);
    const button = new Audio(soundButtonPath);
    click.volume = 0;
    button.volume = 0;
    audioInstances.push(click);
    audioInstances.push(button);
    click.play().then(() => {
        console.log("音频预加载成功!");
    }).catch((error) => {
        console.warn("音频预加载失败: ", error);
    });
    button.play().then(() => {
        console.log("音频预加载成功!");
    }).catch((error) => {
        console.warn("音频预加载失败: ", error);
    });

    console.log("页面加载完成!");
});

window.addEventListener("load", function () {
    const endTime = new Date().getTime();
    let loadTime = endTime - startTime;
    console.log("页面加载耗时: " + loadTime + "ms");
});

function playSound1() {
    const audio = new Audio(soundClickPath);
    audioInstances.push(audio);
    audio.play().then(() => {
        console.log("音效播放成功!");
    }).catch((error) => {
        console.error("音效播放失败: ", error);
    });
}

function playSound2() {
    const audio = new Audio(soundButtonPath);
    audioInstances.push(audio);
    audio.play().then(() => {
        console.log("音效播放成功!");
    }).catch((error) => {
        console.error("音效播放失败: ", error);
    });
}

// 切换Tab Bar
const tabContent = document.querySelector(".tab_content");
if (tabContent) {
    const defaultTabContent = document.querySelector(".tab_content.active");
    console.log("Tab Bar初始选中: ", defaultTabContent.id);
}

function selectTab(tabNumber) {
    const currentTabContent = document.querySelector(".tab_content.active");
    const selectedTabContent = document.getElementById("content" + tabNumber);
    const selectedSidebarContent = document.getElementById("sidebar_content" + tabNumber);
    console.log("Tab Bar当前选中: ", currentTabContent.id);
    console.log("Tab Bar交互选中: ", selectedTabContent.id);
    if (currentTabContent === selectedTabContent) {
        //选中一致
        console.log("点击了已选中Tab");
    } else {
        // 选中不一致
        // 在切换选项卡时播放声音
        playSound1();

        // 切换Tab Bar选项卡
        document.querySelectorAll('.tab_bar_btn').forEach(button => {
            button.classList.remove('active');
            button.classList.add('no_active');
        });
        let tab_btn = document.getElementById(`tab${tabNumber}`);
        tab_btn.classList.add('active');
        tab_btn.classList.remove('no_active');
        console.log("切换Tab标签");

        // 切换Tab Bar包含内容
        const tabContents = document.getElementsByClassName("tab_content");
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].classList.remove("active");
            tabContents[i].classList.add("no_active");
        }
        selectedTabContent.classList.add("active");
        selectedTabContent.classList.remove("no_active");

        // 切换侧边栏包含内容
        const sidebarContents = document.getElementsByClassName("tab_sidebar");
        if (sidebarContents) {
            for (let i = 0; i < sidebarContents.length; i++) {
                sidebarContents[i].classList.remove("active");
                sidebarContents[i].classList.add("no_active");
            }
            selectedSidebarContent.classList.add("active");
            selectedSidebarContent.classList.remove("no_active");
        }

        console.log("切换与Tab相关的内容");
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebarOpen) {
        sidebar.style.width = "0";
        console.log("侧边栏执行收起操作");
    } else {
        sidebar.style.width = "160px";
        console.log("侧边栏执行展开操作");
    }
    sidebarOpen = !sidebarOpen;
    console.log("更新侧边栏状态成功");
}

// 切换遮罩
function toggleOverlay() {
    const overlay_main = document.getElementById("overlay_main");
    if (overlayShow) {
        overlay_main.style.display = "none";
        console.log("遮罩成功隐藏");
    } else {
        overlay_main.style.display = "block";
        console.log("遮罩成功显示");
    }
    overlayShow = !overlayShow;
    console.log("更新遮罩状态成功");
}

// 按键音效
function playSound(button) {
    if (button.classList.contains("normal_btn") || button.classList.contains("red_btn")) {
        console.log("选择播放点击音效");
        playSound1();
    } else if (button.classList.contains("green_btn")) {
        console.log("选择播放按钮音效");
        playSound2();
    }
}

// 点击菜单图标事件
function clickedMenu() {
    playSound1();
    toggleSidebar();
    toggleOverlay();
}

function toUpdatelog() {
    setTimeout(function () {
        window.location.href = updatelogPath;
    }, 600);
}

function toRepo() {
    setTimeout(function () {
        window.open("https://github.com/Spectrollay" + rootPath + "issues/new");
    }, 600);
}

// 点击返回按钮事件
function clickedBack() {
    console.log("点击返回");
    playSound1();
    if (window.history.length <= 1) {
        console.log("关闭窗口");
        setTimeout(function () {
            window.close();
        }, 600);
    } else {
        console.log("返回上一级页面");
        setTimeout(function () {
            window.history.back();
        }, 600);
    }
}

// 点击仓库图标事件
function repoPage() {
    window.open("https://github.com/Spectrollay" + rootPath);
}

// 点击设置图标事件
function settingsPage() {
    playSound1();
    setTimeout(function () {
        window.location.href = rootPath + "advanced/settings.html";
    }, 600);
}

// 点击Debug图标事件
function debugPage() {
    setTimeout(function () {
        window.location.href = rootPath + "advanced/debug.html";
    }, 600);
}

// 跳转实验性页面
function flagsPage() {
    setTimeout(function () {
        window.location.href = rootPath + "experimental/flags.html";
    }, 600);
}

function toOldDesignUpdatelog() {
    setTimeout(function () {
        window.location.href = hostPath + "/minecraft_repository/updatelog/updatelog.html";
    }, 600);
}

// 跳转链接
function jumpToPage(link) {
    playSound1();
    setTimeout(function () {
        window.location.href = link;
    }, 320);
}

// 打开网页
function openLink(url) {
    window.open(url);
}

function delayedOpenLink(url) {
    setTimeout(function () {
        window.open(url);
    }, 1500);
}

// 点击全屏遮罩事件
function clickedOverlay() {
    toggleSidebar();
    toggleOverlay();
}

// 点击侧边栏底部按钮事件
function clickedSidebarBottomBtn() {
    playSound1();
    window.open("https://github.com/Spectrollay/minecraft_kit");
}

// 回到网页顶部
function scrollToTop() {
    main.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    console.log("成功执行回到顶部操作");
}

function toTop() {
    main.scrollTo({
        top: 0,
        behavior: "instant"
    });
}

// Expandable Card函数
const expandableCardGroup = document.getElementsByClassName('expandable_card_group');

for (let i = 0; i < expandableCardGroup.length; i++) {
    const expandableCardArea = expandableCardGroup[i].querySelectorAll('.expandable_card_area');
    for (let j = 0; j < expandableCardArea.length; j++) {

        const expandableCardId = document.getElementById(expandableCardArea[j].id);
        const expandableCard = expandableCardId.querySelector('.expandable_card');
        const expandableContent = expandableCardId.querySelector('.expandable_card_down_area');
        const cardImage = expandableCard.querySelector('.expandable_card_image');
        const cardDown = expandableContent.querySelector('.expandable_card_down');

        let isExpanded = expandableCard.classList.contains("expanded");

        if (isExpanded) {
            cardImage.src = '../images/arrowUp_white.png';
            expandableContent.classList.add('expanded');

            setTimeout(function () {
                const initialHeight = cardDown.scrollHeight;
                expandableContent.style.height = initialHeight + 'px';
            }, 400);

        } else {
            cardImage.src = '../images/arrowDown_white.png';
            expandableContent.classList.add('no_expanded');
            expandableContent.style.height = '0';
        }

        expandableCard.addEventListener('click', () => {
            isExpanded = expandableCard.classList.contains("expanded");
            if (isExpanded) {
                // 折叠当前卡片
                expandableCard.classList.add('no_expanded');
                expandableCard.classList.remove('expanded');
                expandableContent.classList.add('no_expanded');
                expandableContent.classList.remove('expanded');
                expandableContent.style.height = '0';
                cardImage.src = '../images/arrowDown_white.png';
            } else {
                for (let k = 0; k < expandableCardArea.length; k++) {
                    if (k !== j) {
                        const otherCard = expandableCardArea[k].querySelector('.expandable_card');
                        const otherContent = expandableCardArea[k].querySelector('.expandable_card_down_area');
                        const otherCardImage = otherCard.querySelector('.expandable_card_image');

                        otherCard.classList.add('no_expanded');
                        otherCard.classList.remove('expanded');
                        otherContent.classList.add('no_expanded');
                        otherContent.classList.remove('expanded');
                        otherContent.style.height = '0';
                        otherCardImage.src = '../images/arrowDown_white.png';
                    }
                }
                // 展开当前卡片
                expandableCard.classList.add('expanded');
                expandableCard.classList.remove('no_expanded');
                expandableContent.classList.add('expanded');
                expandableContent.classList.remove('no_expanded');
                expandableContent.style.height = cardDown.scrollHeight + 'px';
                cardImage.src = '../images/arrowUp_white.png';
            }
            isExpanded = !isExpanded;
        });

        window.addEventListener('resize', function () {
            isExpanded = expandableCard.classList.contains("expanded");
            if (isExpanded) {
                expandableContent.style.transition = 'height 0ms';
                expandableContent.style.height = cardDown.scrollHeight + 'px';
                setTimeout(function () {
                    expandableContent.style.transition = 'height 600ms';
                }, 0);
            }
        });
    }
}
