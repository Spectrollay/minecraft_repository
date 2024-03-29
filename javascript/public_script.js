let sidebarOpen = false;
let overlayShow = false;

const startTime = new Date().getTime();
const audioInstances = [];
const main = document.getElementById("main");

const currentURL = window.location.href;
const currentPagePath = window.location.pathname;
const hostPath = window.location.origin;
const parts = currentPagePath.split('/').filter(Boolean);
const rootPath = '/' + (parts.length > 0 ? parts[0] + '/' : '');
const linkImg = document.getElementsByClassName('link_img');
const linkImgBlack = document.getElementsByClassName('link_img_black');

const soundClickPath = rootPath + 'sounds/click.ogg';
const soundButtonPath = rootPath + 'sounds/button.ogg';
const updatelogPath = rootPath + 'updatelog/updatelog.html';

console.log("根路径: ", rootPath);
console.log("当前路径: ", currentPagePath);

for (let i = 0; i < linkImg.length; i++) {
    const linkImgList = linkImg[i];
    linkImgList.src = rootPath + "images/ExternalLink_white.png";
}

for (let i = 0; i < linkImgBlack.length; i++) {
    const linkImgList = linkImgBlack[i];
    linkImgList.src = rootPath + "images/ExternalLink.png";
}

// 禁止拖动元素
const images = document.querySelectorAll("img");
const links = document.querySelectorAll("a");
images.forEach(function (image) {
    image.draggable = false;
});

links.forEach(function (link) {
    link.draggable = false;
});

// 禁用右键菜单
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

// 禁用长按菜单
document.addEventListener('touchstart', function (event) {
    event.preventDefault();
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
    console.log("浏览器UA: ", navigator.userAgent)
    if (!localStorage.getItem('neverShowCompatibilityModalAgain') || localStorage.getItem('neverShowCompatibilityModalAgain') === 'false') {
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
    localStorage.setItem('neverShowCompatibilityModalAgain', 'true');
    console.log("关闭兼容性提示弹窗且不再提示");
}

document.body.insertAdjacentHTML('afterbegin', compatibilityModal);

// 输出错误日志
window.addEventListener("error", function (event) {
    console.error("错误: ", event.message);
});

// 输出运行日志
document.addEventListener("DOMContentLoaded", function () {
    console.log("页面加载完成!");
    if (currentURL.startsWith('file:///')) {
        console.log('当前运行在本地');
    } else {
        if (currentURL.includes('github.io/')) {
            console.log("当前运行在Github");
        } else if (currentURL.includes('gitee.io/')) {
            console.log("当前运行在Gitee");
        } else {
            console.log("当前运行在" + currentURL);
        }
        if (currentURL.includes('test')) {
            console.log("环境为测试环境");
        } else {
            console.log("环境为标准环境");
        }
    }
});

window.addEventListener("load", function () {
    const endTime = new Date().getTime();
    let loadTime = endTime - startTime;
    console.log("页面加载耗时: " + loadTime + "ms");
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
        window.open("https://github.com/Spectrollay/minecraft_repository/issues/new");
    }, 600);
}

function delayedOpenLink(url) {
    playSound1();
    setTimeout(function () {
        window.location.href = url;
    }, 600);
}

// 点击返回按钮事件
function clickedBack() {
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

// 点击全屏遮罩事件
function clickedOverlay() {
    toggleSidebar();
    toggleOverlay();
}

// 点击仓库图标事件
function clickedRepo() {
    playSound1();
    window.open("https://github.com/Spectrollay/minecraft_repository");
}

// 点击Debug图标事件
function debugPage() {
    playSound1();
    setTimeout(function () {
        window.location.href = "../advanced/debug.html";
    }, 600);
}

// 跳转实验性页面
function flagsPage() {
    playSound1();
    setTimeout(function () {
        window.location.href = "../experimental/flags.html";
    }, 600);
}

// 点击侧边栏底部按钮事件
function clickedSidebarBottomBtn() {
    playSound1();
    window.open("https://github.com/Spectrollay/minecraft_kit");
}

function toNewDesignUpdatelog() {
    setTimeout(function () {
        window.location.href = hostPath + "/minecraft_repository_test/updatelog/";
    }, 600);
}

// 跳转链接
function jumpToPage(link) {
    playSound1();
    setTimeout(function () {
        window.location.href = link;
    }, 320);
}

// 回到网页顶部
function scrollToTop() {
    main.scrollTo({
        top: 0,
        behavior: "smooth"
    });
    console.log("成功执行回到顶部操作");
}