// 点击Debug图标事件
function debugPage() {
    setTimeout(function () {
        window.location.href = rootPath + "advanced/debug.html";
    }, 600);
}

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
