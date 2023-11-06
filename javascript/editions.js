let openurl;

// 免责申明弹窗
function showDisclaimerDialog(url) {
    const overlay = document.getElementById("overlay");
    const dialog = document.getElementById("disclaimer_dialog");
    overlay.style.display = "block";
    dialog.style.display = "block";
    console.log("显示免责声明弹窗");
    if (url === undefined) {
        openurl = null;
    } else {
        openurl = url;
    }
}

function hideDisclaimerDialog(button, state, url) {
    const overlay = document.getElementById("overlay");
    const dialog = document.getElementById("disclaimer_dialog");
    playSound(button);
    overlay.style.display = "none";
    dialog.style.display = "none";
    if (state === -1) {
        console.log("选择了不同意");
    } else if (state === 1) {
        console.log("选择了同意并继续");
    }
    console.log("关闭免责声明弹窗");
    if (url !== null) {
        console.log("获取到跳转链接:" + url);
        if (state === 1) {
            window.open(url);
        } else {
            setTimeout(function () {
                window.location.href = url;
            }, 600);
        }
        console.log("跳转成功");
    } else {
        console.log("无跳转链接");
    }
}

function howToBuyGame(button, state, url) {
    playSound(button);
    if (state === 0) {
        console.log("选择了了解正版购买");
    }
    console.log("获取到跳转链接: " + url);
    setTimeout(function () {
        window.location.href = url;
    }, 600);
    console.log("跳转成功");
}