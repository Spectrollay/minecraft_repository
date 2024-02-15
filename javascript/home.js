document.addEventListener("DOMContentLoaded", function() {
    // showAlertModal();
});

// 预览提示弹窗
// function showAlertModal() {
//     const overlay = document.getElementById("overlay");
//     const modal = document.getElementById("alert_modal");
//     overlay.style.display = "block";
//     modal.style.display = "block";
//     console.log("显示提示弹窗");
// }

function hideAlertModal(button) {
    const overlay = document.getElementById("overlay");
    const modal = document.getElementById("alert_modal");
    playSound(button);
    overlay.style.display = "none";
    modal.style.display = "none";
    console.log("关闭提示弹窗");
}