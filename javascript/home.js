document.addEventListener("DOMContentLoaded", function() {
    showAlertDialog();
});

// 预览提示弹窗
function showAlertDialog() {
    const overlay = document.getElementById("overlay");
    const dialog = document.getElementById("alert_dialog");
    overlay.style.display = "block";
    dialog.style.display = "block";
    console.log("显示预览提示弹窗");
}

function hideAlertDialog(button) {
    const overlay = document.getElementById("overlay");
    const dialog = document.getElementById("alert_dialog");
    playSound(button);
    overlay.style.display = "none";
    dialog.style.display = "none";
    console.log("关闭预览提示弹窗");
}