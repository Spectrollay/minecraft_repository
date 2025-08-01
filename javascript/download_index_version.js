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
hostPath = window.location.origin;
data = hostPath + '/data';

const currentUrl = window.location.href;
const url = new URL(currentUrl);

// TODO 在加入基岩版Windows平台版本时移除
if (currentUrl.includes('/download/') &&
    url.searchParams.get('platform') === 'windows') {
    jumpToPage('./default/coming_soon.html');
}

// 获取URL参数
const version = url.searchParams.get('version');
const platformIcon = document.querySelector('.platform_icon');
const mainContainer = document.querySelector('generate-area.main_gen');
const mainTitle = document.getElementById('main_title');
const sidebarContainer = document.querySelector('generate-area.sidebar_gen');
const sidebarTitle = document.getElementById('sidebar_title');
let platform, platformName, edition, ifJump = 'false', dataFile, dataPath;

if (hostPath.includes('https')) {
    dataPath = data + '/minecraft_repository';
} else {
    dataPath = rootPath + '/data';
}

if (url.searchParams.get('platform') === 'android') {
    platform = 'android';
    platformName = 'Android';
} else if (url.searchParams.get('platform') === 'ios') {
    platform = 'ios';
    platformName = 'iOS';
} else if (url.searchParams.get('platform') === 'windows') {
    platform = 'windows';
    platformName = 'Windows';
} else if (url.searchParams.get('platform') === 'linux') {
    platform = 'linux';
    platformName = 'Linux';
} else {
    ifJump = 'true';
}

if (!version) {
    ifJump = 'true';
}

if (window.location.pathname.includes('download/bedrock/')) {
    dataFile = dataPath + '/bedrock_versions.json';
    const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    if (collator.compare(version, '1.2') < 0) {
        edition = '携带版';
    } else {
        edition = '基岩版';
    }
} else if (window.location.pathname.includes('download/java/')) {
    // dataFile = dataPath + '/java_versions.json';
    edition = 'Java版';
} else if (window.location.pathname.includes('download/education/')) {
    // dataFile = dataPath + '/education_versions.json';
    edition = '教育版';
} else if (window.location.pathname.includes('download/server/')) {
    // dataFile = dataPath + '/server_versions.json';
    edition = '服务端';
} else if (window.location.pathname.includes('download/trial/')) {
    // dataFile = dataPath + '/trial_versions.json';
    edition = '试玩版';
} else if (window.location.pathname.includes('download/story_mode/')) {
    // dataFile = dataPath + '/story_mode_versions.json';
    edition = '故事模式';
} else if (window.location.pathname.includes('download/earth/')) {
    // dataFile = dataPath + '/earth_versions.json';
    edition = 'Earth';
} else if (window.location.pathname.includes('download/dungeons/')) {
    // dataFile = dataPath + '/dungeons_versions.json';
    edition = 'Dungeons';
} else if (window.location.pathname.includes('download/legends/')) {
    // dataFile = dataPath + '/legends_versions.json';
    edition = 'Legends';
}

// 获取下拉菜单数据
const dropdownData = JSON.parse(localStorage.getItem(`(${rootPath}/)dropdown_value`)) || {};

(async () => {
    if (dataFile && mainContainer && sidebarContainer) {
        try {
            const response = await fetch(dataFile);
            let rawJson = await response.text(); // 获取原始文本
            const cleanedJson = rawJson.replace(/ \/\/.*|\/\*[\s\S]*?\*\//g, '').trim(); // 移除注释
            const data = JSON.parse(cleanedJson); // 解析为JSON对象

            const majorVersions = data[0].major_versions;

            // 获取主版本
            const majorVersion = majorVersions.find(mv => mv.main_version === version);
            if (!majorVersion) {
                logManager.log(`主版本 ${version} 未找到`, 'error');
                ifJump = 'true';
            }

            const {version_name, prev_version, next_version} = majorVersion;

            // 更新按钮状态
            const updateName = document.getElementById('update_name');
            const prevButtons = document.querySelectorAll('.prev_version');
            const nextButtons = document.querySelectorAll('.next_version');
            const currentUrl = new URL(window.location.href);
            const searchParams = currentUrl.searchParams;

            // 更新标题
            updateName.innerHTML = `${version_name}`;
            sidebarTitle.innerHTML = `${version_name.replace(' - ', '<br>')}`;

            // 更新上一个版本按钮
            prevButtons.forEach(prevButton => {
                if (prev_version && prev_version !== '') {
                    searchParams.set('version', prev_version);
                    const prevLink = `${currentUrl.origin}${currentUrl.pathname}?${searchParams.toString()}`;
                    prevButton.setAttribute('data', 'default|normal|extra_small||false||');
                    prevButton.setAttribute('js', `ifNavigating('jump', '${prevLink}');`);
                    prevButton.setAttribute('text', `<img alt='' class='button_img left' src='./images/arrowLeft.png'/>${prev_version}`
                    );
                } else {
                    prevButton.setAttribute('data', 'default|disabled|extra_small||false||');
                    prevButton.setAttribute('js', '');
                    prevButton.setAttribute('text', `<img alt='' class='button_img left' src='./images/arrowLeft.png'/>上个版本`);
                }
            })

            // 更新下一个版本按钮
            nextButtons.forEach(nextButton => {
                if (next_version && next_version !== '') {
                    searchParams.set('version', next_version);
                    const nextLink = `${currentUrl.origin}${currentUrl.pathname}?${searchParams.toString()}`;
                    nextButton.setAttribute('data', 'default|normal|extra_small||false||');
                    nextButton.setAttribute('js', `ifNavigating('jump', '${nextLink}');`);
                    nextButton.setAttribute('text', `${next_version}<img alt='' class='button_img right' src='./images/arrowRight.png'/>`
                    );
                } else {
                    nextButton.setAttribute('data', 'default|disabled|extra_small||false||');
                    nextButton.setAttribute('js', '');
                    nextButton.setAttribute('text', `下个版本<img alt='' class='button_img right' src='./images/arrowRight.png'/>`);
                }
            })

            // 清除原有内容
            mainContainer.innerHTML = '';
            sidebarContainer.innerHTML = '';

            // 遍历该大版本的所有小版本
            majorVersion.child_versions.forEach((currentVersion) => {
                const version_platform = platform in currentVersion.platforms;
                if (!version_platform) return;

                const dropdownId = `${platform}_${currentVersion.id}`;
                const versionValue = dropdownData[dropdownId] || 1;
                const platformData = currentVersion.platforms[platform];
                const platformLocation = platformData.channels[`channel${versionValue}`];

                const mainBlock = document.createElement('div');
                const sidebarBlock = document.createElement('div');

                // 填充主要内容块
                mainBlock.innerHTML = `
                    <div class="version_block_left wrap_flex" id="${currentVersion.id}">
                        <div class="version_info">
                            <div class="title2 download_block_title">${currentVersion.version_name}</div>
                            ${currentVersion.update_artwork ? `<div class="drop_artwork_area">
                                <img alt="" class="update_artwork" src="./images/update/artwork/${currentVersion.update_artwork}"/>
                            </div>` : ''}
                        </div>
                        <div class="wrap_flex">
                            ${currentVersion.platforms[platform].info === 'false' ? '' : `
                                <div class="download_block_description update_description">
                                    <div>正式版本: ${currentVersion.platforms[platform].release}</div>
                                    <div>测试版本: ${currentVersion.platforms[platform].build}</div>
                                    <div>${currentVersion.platforms[platform].support}</div>
                                    <div>架构: ${currentVersion.platforms[platform].arch}</div>
                                    <div>类型: ${currentVersion.platforms[platform].type}</div>
                                    <div>大小: ${currentVersion.platforms[platform].size}</div>
                                    <div>备注: ${currentVersion.platforms[platform].note}</div>
                                </div>
                            `}
                            <div class="download_block_new_list">
                                ${currentVersion.platforms[platform].style === 'type' ? `
                                    <!-- 按版本类型 -->
                                    <div class="dropdown_container">
                                        <custom-dropdown data-option='["<div class=\\"wrap_flex\\"><img class=\\"small_icon\\" src=\\"./images/Crown.png\\"/>OneDrive</div>", "百度网盘", "夸克网盘", "123云盘"]' data-selected="2" id="${platform}_${currentVersion.id}" status="enabled" unselected-text="请选择下载渠道"></custom-dropdown>
                                    </div>
                                ` : ''}
                                <div>
                                    ${currentVersion.platforms[platform].style === 'type' ? `
                                        <!-- 按版本类型 -->
                                        ${Object.entries(currentVersion.platforms[platform].channels).map(([channelKey, channelData]) => `
                                        <div id="${platform}_${currentVersion.id}_${channelKey}">
                                            <div class="btn_group">
                                                ${channelData.原版 ? `
                                                    ${channelData.name === 'OneDrive' ? `
                                                        <custom-button data="default|normal|large||false||" js="checkIfDonate('url', '${channelData.原版}');" text="官方原版"></custom-button>
                                                    ` : `
                                                        <custom-button data="default|normal|large||false||" js="ifNavigating('open', '${channelData.原版}');" text="官方原版"></custom-button>
                                                    `}
                                                ` : `
                                                    <custom-button data="default|disabled|large||false||" js="false" text="官方原版"></custom-button>
                                                `}
                                            </div>
                                            <div class="btn_group">
                                                ${channelData.中文译名修正 ? `
                                                    ${channelData.name === 'OneDrive' ? `
                                                        <custom-button data="default|green|small||false||" js="checkIfDonate('url', '${channelData.中文译名修正}');" text="中文译名修正"></custom-button>
                                                    ` : `
                                                        <custom-button data="default|green|small||false||" js="showDisclaimerModal('${channelData.中文译名修正}');" text="中文译名修正"></custom-button>
                                                    `}
                                                ` : `
                                                    <custom-button data="default|disabled|small||false||" js="false" text="中文译名修正"></custom-button>
                                                `}
                                                ${channelData.去验证版 ? `
                                                    ${channelData.name === 'OneDrive' ? `
                                                        <custom-button data="default|normal|small||false||" js="checkIfDonate('url', '${channelData.去验证版}');" text="去验证版"></custom-button>
                                                    ` : `
                                                        <custom-button data="default|normal|small||false||" js="showDisclaimerModal('${channelData.去验证版}');" text="去验证版"></custom-button>
                                                    `}
                                                ` : `
                                                    <custom-button data="default|disabled|small||false||" js="false" text="去验证版"></custom-button>
                                                `}
                                            </div>
                                            ${currentVersion.platforms[platform].more_type === 'false' ? `` : `
                                            <div class="btn_group">
                                                ${channelData.多架构版 ? `
                                                    ${channelData.name === 'OneDrive' ? `
                                                        <custom-button data="default|normal|small||false||" js="checkIfDonate('url', '${channelData.多架构版}');" text="多架构版"></custom-button>
                                                    ` : `
                                                        <custom-button data="default|normal|small||false||" js="showDisclaimerModal('${channelData.多架构版}');" text="多架构版"></custom-button>
                                                    `}
                                                ` : `
                                                    <custom-button data="default|disabled|small||false||" js="false" text="多架构版"></custom-button>
                                                `}
                                                ${channelData.精简版 ? `
                                                    ${channelData.name === 'OneDrive' ? `
                                                        <custom-button data="default|normal|small||false||" js="checkIfDonate('url', '${channelData.精简版}');" text="精简版"></custom-button>
                                                    ` : `
                                                        <custom-button data="default|normal|small||false||" js="showDisclaimerModal('${channelData.精简版}');" text="精简版"></custom-button>
                                                    `}
                                                ` : `
                                                    <custom-button data="default|disabled|small||false||" js="false" text="精简版"></custom-button>
                                                `}
                                            </div>
                                            `}
                                        </div>`).join('')}
                                    ` : ''}
                                    ${currentVersion.platforms[platform].style === 'channel' ? `
                                        <!-- 按下载渠道 -->
                                        ${Object.entries(currentVersion.platforms[platform].channels).map(([channelKey, channelData]) => `
                                        <div class="btn_group">
                                            ${channelData.完整 ? `
                                                ${channelData.name === 'OneDrive' ? `
                                                    <custom-button data="default|green|large||true|捐赠专享|Crown" js="checkIfDonate('url', '${channelData.完整}');" text="${channelData.name}"></custom-button>
                                                ` : `
                                                    <custom-button data="default|normal|large||false||" js="ifNavigating('open', '${channelData.完整}');" text="${channelData.name}"></custom-button>
                                                `}
                                            ` : `
                                                ${channelData.name === 'OneDrive' ? `
                                                    <custom-button data="default|disabled|large||true|捐赠专享|Crown" js="false" text="${channelData.name}"></custom-button>
                                                ` : `
                                                    <custom-button data="default|disabled|large||false||" js="false" text="${channelData.name}"></custom-button>
                                                `}
                                            `}
                                        </div>
                                        `).join('')}
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // 填充侧边栏块
                sidebarBlock.innerHTML = `
                    <a class="sidebar_item" href="${window.location.origin}${window.location.pathname}${window.location.search}#${currentVersion.id}">
                        <article_list>${currentVersion.version_name}</article_list>
                    </a>
                `;

                // 添加到容器中
                mainContainer.appendChild(mainBlock);
                sidebarContainer.appendChild(sidebarBlock);
                setTimeout(replaceLoadingImages, 100); // 占位图逻辑
            });

            setTimeout(function () {
                mainHandleScroll(); // 联动自定义网页滚动条
            }, 10)
        } catch (error) {
            logManager.log("加载版本索引错误: " + error.message, 'error');
        }
    }

    if (ifJump === 'true') {
        ifNavigating('direct', './default/error_not-found.html');
    }
})();

document.title = `${platformName} - ${version} - ${edition} - 星月Minecraft版本库`;
platformIcon.src = `${rootPath}/images/logo/${platformName}.png`;
mainTitle.innerHTML = `${platformName} - ${version} - ${edition}<img alt="" class="share_img_title" onclick="playSound('click');copyText(window.location.href, 'link');" src="./images/ExternalLink_white.png"/>`;

document.addEventListener('DOMContentLoaded', function () {
    const checkDropdownsExist = setInterval(() => {
        const dropdowns = document.querySelectorAll('custom-dropdown');

        // 若存在则停止检查
        if (dropdowns.length > 0) {
            clearInterval(checkDropdownsExist);  // 清除定时器
            const dropdownValues = JSON.parse(localStorage.getItem(`(${rootPath}/)dropdown_value`)) || {};

            dropdowns.forEach(dropdown => {
                const dropdownValue = dropdownValues[dropdown.id] || dropdown.getAttribute('data-selected');

                // 隐藏所有元素
                for (let i = 1; i <= 4; i++) {
                    const element = document.getElementById(`${dropdown.id}_channel${i}`);
                    if (element) {
                        element.style.display = 'none';  // 隐藏元素
                    }
                }

                // 显示选中的元素
                const selectedElement = document.getElementById(`${dropdown.id}_channel${dropdownValue}`);
                if (selectedElement) {
                    selectedElement.style.display = 'block';  // 显示选中的元素
                }

                // 监听下拉框值变化
                dropdown.addEventListener('dropdown-value-change', (e) => {
                    const dropdownId = e.target.id;
                    const value = e.detail.value;

                    // 隐藏所有元素
                    for (let i = 1; i <= 4; i++) {
                        const element = document.getElementById(`${dropdownId}_channel${i}`);
                        if (element) {
                            element.style.display = 'none';  // 隐藏元素
                        }
                    }

                    // 显示选中的元素
                    const selectedElement = document.getElementById(`${dropdownId}_channel${value}`);
                    if (selectedElement) {
                        selectedElement.style.display = 'block';  // 显示选中的元素
                    }
                });
            });
        }
    }, 10);
});
