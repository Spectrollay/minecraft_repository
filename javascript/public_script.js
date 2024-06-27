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

// 页面滚动条
const scrollContainer = document.querySelector('scroll-container');
const mainContent = document.querySelector('.main_scroll_container');
const customScrollbar = document.querySelector('custom-scrollbar');
const customThumb = document.querySelector('custom-scrollbar-thumb');
const sidebar = document.querySelector('#sidebar');
let sidebarContainer;
let sidebarContent;
let sidebarCustomScrollbar;
let sidebarThumb;
if (sidebar) {
    sidebarContainer = document.querySelector('#sidebar_scroll_container');
    sidebarContent = sidebarContainer.querySelector('.sidebar_content');
    sidebarCustomScrollbar = sidebar.querySelector('custom-scrollbar');
    sidebarThumb = sidebar.querySelector('custom-scrollbar-thumb');
}

let scrollTimeout;
let isDragging;

function updateThumb() {
    const scrollHeight = mainContent.scrollHeight;
    const containerHeight = scrollContainer.getBoundingClientRect().height;
    customScrollbar.style.height = containerHeight + 'px';
    if (mainContent.classList.contains('main_with_tab_bar')) {
        customScrollbar.style.top = '100px';
    }
    let thumbHeight = Math.max((containerHeight / scrollHeight) * containerHeight, 20);
    customThumb.style.height = `${thumbHeight}px`;
    let maxScrollTop = scrollHeight - containerHeight;
    const currentScrollTop = Math.round(scrollContainer.scrollTop);
    const thumbPosition = (currentScrollTop / maxScrollTop) * (containerHeight - (thumbHeight + 4));
    customThumb.style.top = `${thumbPosition}px`;
    console.log(thumbHeight)
    console.log(containerHeight)
    if (thumbHeight + 0.5 >= containerHeight) {
        customScrollbar.style.display = 'none';
    } else {
        customScrollbar.style.display = 'block';
    }
}

function updateSidebarThumb() {
    const scrollHeight = sidebarContent.scrollHeight;
    const containerHeight = Math.floor(sidebarContainer.getBoundingClientRect().height);
    const thumbHeight = Math.max((containerHeight / scrollHeight) * containerHeight, 20);
    const maxScrollTop = scrollHeight - containerHeight;
    const currentScrollTop = Math.round(sidebarContainer.scrollTop);
    const thumbPosition = (currentScrollTop / maxScrollTop) * (containerHeight - (thumbHeight + 4));

    if (thumbHeight >= containerHeight) {
        sidebarCustomScrollbar.style.display = 'none';
    } else {
        sidebarCustomScrollbar.style.display = 'block';
    }

    sidebarThumb.style.height = `${thumbHeight}px`;
    sidebarThumb.style.top = `${thumbPosition}px`;
}

function showScroll() {
    clearTimeout(scrollTimeout);
    customScrollbar.style.opacity = "1";
    scrollTimeout = setTimeout(() => {
        customScrollbar.style.opacity = "0";
    }, 3000);
}

function showSidebarScroll() {
    clearTimeout(scrollTimeout);
    sidebarCustomScrollbar.style.opacity = "1";
    scrollTimeout = setTimeout(() => {
        sidebarCustomScrollbar.style.opacity = "0";
    }, 3000);
}

function handleScroll() {
    showScroll();
    updateThumb();
}

function startDrag() {
    isDragging = true;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopDrag);
}

function onDrag(e) {
    if (!isDragging) return;

    const mouseY = e.clientY || e.touches[0].clientY;
    const {top, height: containerHeight} = scrollContainer.getBoundingClientRect();
    const thumbHeight = customThumb.offsetHeight;
    const maxThumbTop = containerHeight - thumbHeight;
    const newTop = Math.min(Math.max(mouseY - top - thumbHeight / 2, 0), maxThumbTop);
    const maxScrollTop = mainContent.scrollHeight - containerHeight;
    scrollContainer.scrollTo({
        top: (newTop / maxThumbTop) * maxScrollTop,
        behavior: "instant"
    });
    updateThumb();
}

function stopDrag() {
    setTimeout(() => { isDragging = false; }, 0);
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDrag);
}

function handleScrollbarClick(e) {
    if (isDragging) return;

    const {top, height: scrollbarHeight} = customScrollbar.getBoundingClientRect();
    const clickPosition = e.clientY - top;
    const thumbHeight = customThumb.offsetHeight;
    const containerHeight = scrollContainer.clientHeight;
    const maxScrollTop = mainContent.scrollHeight - containerHeight;
    scrollContainer.scrollTop = (clickPosition / (scrollbarHeight - thumbHeight)) * maxScrollTop;
    updateThumb();
}

if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    scrollContainer.addEventListener('touchmove', handleScroll);
    scrollContainer.addEventListener('mousemove', handleScroll);

    window.addEventListener('load', function () {
        setTimeout(function () {
            handleScroll();
        }, 10);
    });

    // 添加鼠标和触摸事件
    customThumb.addEventListener('mousedown', startDrag);
    customThumb.addEventListener('touchstart', startDrag);

    // 添加点击滚动条事件
    customScrollbar.addEventListener('click', handleScrollbarClick);
}

if (sidebarContainer) {
    sidebarContainer.addEventListener('scroll', () => {
        showSidebarScroll();
        updateSidebarThumb();
    });

    window.addEventListener('load', function () {
        setTimeout(function () {
            showSidebarScroll();
            updateSidebarThumb();
        }, 10);
    });

    window.addEventListener('resize', function () {
        showSidebarScroll();
        updateSidebarThumb();
    });
    sidebarContainer.addEventListener('touchmove', showSidebarScroll);
    sidebarContainer.addEventListener('mousemove', showSidebarScroll);
}

// 路径检测
const currentURL = window.location.href;
const currentPagePath = window.location.pathname;
const hostPath = window.location.origin;
const parts = currentPagePath.split('/').filter(Boolean);
const rootPath = '/' + (parts.length > 0 ? parts[0] + '/' : '');
const slashCount = (currentPagePath.match(/\//g) || []).length;

// 创建内联元素
const custom_elements_css = document.createElement('link');
custom_elements_css.rel = 'stylesheet';
custom_elements_css.href = rootPath + 'stylesheet/custom_elements.css';
const public_style = document.createElement('link');
public_style.rel = 'stylesheet';
public_style.href = rootPath + 'stylesheet/public_style.css';

// 将内联元素添加到头部
document.head.appendChild(custom_elements_css);
document.head.appendChild(public_style);

const soundClickPath = rootPath + 'sounds/click.ogg';
const soundButtonPath = rootPath + 'sounds/button.ogg';
const updatelogPath = rootPath + 'updatelog/';
const messagePath = rootPath + 'notifications/';
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
    // Gitee Pages 已下线
// } else if (hostPath.includes('gitee.io')) {
//     console.log("当前运行在Gitee");
//     // 禁用右键菜单
//     document.addEventListener('contextmenu', function (event) {
//         event.preventDefault();
//     });
//     // 禁用长按菜单
//     document.addEventListener('touchstart', function (event) {
//         event.preventDefault();
//     });
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
    <div class="overlay" id="overlay_compatibility_modal" tabindex="-1"></div>
    <modal_area id="compatibility_modal" tabindex="-1">
        <modal>
            <modal_title_area>
                <modal_title>兼容性提示</modal_title>
            </modal_title_area>
            <modal_content>
                    <p>由于不同平台的代码支持存在些许差异, 为确保你的使用体验, 我们推荐通过以下浏览器及内核的最新发行版访问本站以获得完全的特性支持</p>
                    <p>浏览器: Edge / Chrome / Safari / Firefox<br>内核: Chromium / Android WebView / Apple WebKit</p>
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

document.body.insertAdjacentHTML('afterbegin', compatibilityModal);

setTimeout(function () {
    if (localStorage.getItem(`(${rootPath})neverShowCompatibilityModalAgain`) !== '1') {
        const overlay = document.getElementById("overlay_compatibility_modal");
        const modal = document.getElementById("compatibility_modal");
        overlay.style.display = "block";
        modal.style.display = "block";
        console.log("显示兼容性提示弹窗");
    }
}, 100);

function hideCompatibilityModal(button) {
    const overlay = document.getElementById("overlay_compatibility_modal");
    const modal = document.getElementById("compatibility_modal");
    playSound(button);
    overlay.style.display = "none";
    modal.style.display = "none";
    console.log("关闭兼容性提示弹窗");
}

function neverShowCompatibilityModalAgain(button) {
    hideCompatibilityModal(button);
    localStorage.setItem(`(${rootPath})neverShowCompatibilityModalAgain`, '1');
    console.log("关闭兼容性提示弹窗且不再提示");
}

// 访问受限提示
const today = new Date().toISOString().split('T')[0];

const firstVisitTodayModal = `
    <div class="overlay" id="overlay_first_visit_today_modal" tabindex="-1"></div>
    <modal_area id="first_visit_today_modal" tabindex="-1">
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
    const firstVisit = localStorage.getItem(`(${rootPath})firstVisit`);
    const is404Page = document.title.includes("404 NOT FOUND");
    const firstVisitAllowedPaths = [
        `${rootPath}`,
        `${rootPath}index.html`,
        `${rootPath}home.html`
    ];

    // 检查是否是第一次访问且路径不在允许的路径中且不是404页面
    if (firstVisit !== today && !firstVisitAllowedPaths.includes(window.location.pathname) && !is404Page) {
        const overlay = document.getElementById("overlay_first_visit_today_modal");
        const modal = document.getElementById("first_visit_today_modal");
        overlay.style.display = "block";
        modal.style.display = "block";
    }
}

if (window.location.pathname === `${rootPath}` || window.location.pathname === `${rootPath}index.html`) {
    localStorage.setItem(`(${rootPath})firstVisit`, today);
}

function hideFirstVisitTodayModal(button) {
    const overlay = document.getElementById("overlay_first_visit_today_modal");
    const modal = document.getElementById("first_visit_today_modal");
    playSound(button);
    overlay.style.display = "none";
    modal.style.display = "none";
}

setTimeout(function () {
    checkFirstVisit();
}, 150);

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
        // playSound1();
        setTimeout(handleScroll, 100);

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
        if (sidebarContents.length > 0) {
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
    const sidebarContent = document.getElementById("sidebar_scroll_container");
    if (sidebarOpen) {
        sidebar.style.width = "0";
        sidebarContent.style.width = "0";
        console.log("侧边栏执行收起操作");
    } else {
        sidebar.style.width = "160px";
        sidebarContent.style.width = "160px";
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
    if (button.classList.contains("normal_btn") || button.classList.contains("red_btn") || button.classList.contains("sidebar_btn") || (button.classList.contains("tab_bar_btn") && button.classList.contains("no_active")) || button.classList.contains("close_btn")) {
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

function toMessage() {
    setTimeout(function () {
        window.location.href = messagePath;
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

// 跳转主页
function mainPage() {
    setTimeout(function () {
        window.location.href = rootPath;
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
    window.open("https://github.com/Spectrollay/minecraft_kit");
}

// 回到网页顶部
function scrollToTop() {
    scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    console.log("成功执行回到顶部操作");
}

function toTop() {
    scrollContainer.scrollTo({
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
            cardImage.src = `${rootPath}images/arrowUp_white.png`;
            expandableContent.classList.add('expanded');

            setTimeout(function () {
                const initialHeight = cardDown.scrollHeight;
                expandableContent.style.height = initialHeight + 'px';
            }, 400);

        } else {
            cardImage.src = `${rootPath}images/arrowDown_white.png`;
            expandableContent.classList.add('no_expanded');
            expandableContent.style.height = '0';
        }

        expandableCard.addEventListener('click', () => {

            let lastScrollHeight = mainContent.scrollHeight;

            function checkScrollHeightChange() {
                const currentScrollHeight = mainContent.scrollHeight;
                if (lastScrollHeight !== currentScrollHeight) {
                    handleScroll();
                    lastScrollHeight = currentScrollHeight;
                }
            }

            setInterval(checkScrollHeightChange, 1);

            isExpanded = expandableCard.classList.contains("expanded");
            if (isExpanded) {
                // 折叠当前卡片
                expandableCard.classList.add('no_expanded');
                expandableCard.classList.remove('expanded');
                expandableContent.classList.add('no_expanded');
                expandableContent.classList.remove('expanded');
                expandableContent.style.height = '0';
                cardImage.src = `${rootPath}images/arrowDown_white.png`;
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
                        otherCardImage.src = `${rootPath}images/arrowDown_white.png`;
                    }
                }
                // 展开当前卡片
                expandableCard.classList.add('expanded');
                expandableCard.classList.remove('no_expanded');
                expandableContent.classList.add('expanded');
                expandableContent.classList.remove('no_expanded');
                expandableContent.style.height = cardDown.scrollHeight + 'px';
                cardImage.src = `${rootPath}images/arrowUp_white.png`;
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

// 自适应折叠组件
setTimeout(function () {
    const mainDiv = document.getElementById('main');
    const allMessages = mainDiv.querySelectorAll('.message');
    const threshold = 5; // 初始阈值
    let currentThreshold = threshold; // 当前展开的阈值

    // 隐藏超过阈值的消息
    for (let i = threshold; i < allMessages.length; i++) {
        allMessages[i].style.display = 'none';
    }

    const showMoreBtn = document.getElementById('showMoreBtn');
    const showLessBtn = document.getElementById('showLessBtn');

    function updateButtonsVisibility() {
        const showMore = showMoreBtn.parentElement;
        const showLess = showLessBtn.parentElement;
        if (showMoreBtn) {
            if (allMessages.length > currentThreshold) {
                showMore.setAttribute('data', 'folding|green|small|showMoreBtn|false||');
                showMoreBtn.classList.remove('disabled_btn');
                showMoreBtn.classList.add('green_btn');
            } else {
                showMore.setAttribute('data', 'folding|disabled|small|showMoreBtn|false||');
                showMoreBtn.classList.remove('green_btn');
                showMoreBtn.classList.add('disabled_btn');
            }
        }
        if (showLessBtn) {
            if (currentThreshold > threshold) {
                showLess.setAttribute('data', 'folding|normal|small|showMoreBtn|false||');
                showLessBtn.classList.remove('disabled_btn');
                showLessBtn.classList.add('normal_btn');
            } else {
                showLess.setAttribute('data', 'folding|disabled|small|showMoreBtn|false||');
                showLessBtn.classList.remove('normal_btn');
                showLessBtn.classList.add('disabled_btn');
            }
        }
    }

    // 初始化
    if (showMoreBtn || showLessBtn) {
        updateButtonsVisibility();
    }

    if (showMoreBtn) {
        showMoreBtn.addEventListener('click', function () {
            const numToDisplay = Math.min(threshold, allMessages.length - currentThreshold);
            for (let i = currentThreshold; i < currentThreshold + numToDisplay; i++) {
                allMessages[i].style.display = 'block';
            }
            currentThreshold += numToDisplay;
            updateButtonsVisibility();
            handleScroll();
            console.log("展开消息");
        });
    }

    if (showLessBtn) {
        showLessBtn.addEventListener('click', function () {
            const numToHide = Math.min(threshold, currentThreshold - threshold);
            for (let i = currentThreshold - 1; i >= currentThreshold - numToHide; i--) {
                allMessages[i].style.display = 'none';
            }
            currentThreshold -= numToHide;
            updateButtonsVisibility();
            handleScroll();
            console.log("收起消息");
        });
    }
}, 600);

// 清除存储
function clearStorage() {
    localStorage.clear();
    sessionStorage.clear();
    console.log('清除存储数据成功');
}

// 重载页面
function reloadPage() {
    sessionStorage.clear();
    location.reload();
    console.log('重载容器环境成功');
}
