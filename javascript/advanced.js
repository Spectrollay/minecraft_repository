// 切换Tab Bar
const defaultTabContent = document.querySelector(".tab_content.active");
console.log("Tab Bar初始选中: ", defaultTabContent.id);

function selectTab(tabNumber) {
    const currentTabContent = document.querySelector(".tab_content.active");
    const selectedTabContent = document.getElementById("content" + tabNumber);
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
        console.log("切换与Tab相关的内容");
    }
}

// 切换开关
const switchElement = document.getElementById("switch_exp");
const switch_exp_status = document.getElementById("switch_exp_status");
let isOn = false;

// 添加点击事件监听器
switchElement.addEventListener("click", function () {
    isOn = !isOn;
    playSound1();
    switchElement.classList.toggle("on", isOn);
    if (isOn) {
        switch_exp_status.textContent = "开关: 开启";
        console.log("打开开关");
    } else {
        switch_exp_status.textContent = "开关: 关闭";
        console.log("关闭开关");
    }
});