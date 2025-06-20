/*
 *  Copyright © 2020. Spectrollay
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
data = hostPath + "/data";

const mainContainer = document.querySelector("generate-area.main_gen");
const sidebarContainer = document.querySelector("generate-area.sidebar_gen");
let dataFile, dataPath, edition;
if (hostPath.includes('https')) {
    dataPath = data + '/minecraft_repository';
} else {
    dataPath = rootPath + '/data';
}

if (window.location.pathname.includes('download/bedrock/')) {
    dataFile = dataPath + '/bedrock_main.json';
    edition = 'bedrock';
} else if (window.location.pathname.includes('download/java/')) {
    // dataFile = dataPath + '/java_main.json';
    edition = 'java';
} else if (window.location.pathname.includes('download/education/')) {
    dataFile = dataPath + '/education_main.json';
    edition = 'education';
} else if (window.location.pathname.includes('download/server/')) {
    // dataFile = dataPath + '/server_main.json';
    edition = 'server';
} else if (window.location.pathname.includes('download/trial/')) {
    // dataFile = dataPath + '/trial_main.json';
    edition = 'trial';
} else if (window.location.pathname.includes('download/story_mode/')) {
    // dataFile = dataPath + '/story_mode_main.json';
    edition = 'story_mode';
} else if (window.location.pathname.includes('download/earth/')) {
    // dataFile = dataPath + '/earth_main.json';
    edition = 'earth';
} else if (window.location.pathname.includes('download/dungeons/')) {
    // dataFile = dataPath + '/dungeons_main.json';
    edition = 'dungeons';
} else if (window.location.pathname.includes('download/legends/')) {
    // dataFile = dataPath + '/legends_main.json';
    edition = 'legends';
}

if (dataFile && mainContainer && sidebarContainer) {
    fetch(dataFile)
        .then(response => response.text())
        .then(rawJson => {
            const cleanedJson = rawJson.replace(/ \/\/.*|\/\*[\s\S]*?\*\//g, "").trim(); // 移除注释
            const versions = JSON.parse(cleanedJson);

            // 清除原有内容
            mainContainer.innerHTML = '';
            sidebarContainer.innerHTML = '';

            // 遍历所有版本
            versions.forEach(version => {
                const mainBlock = document.createElement("div");
                const sidebarBlock = document.createElement("div");

                mainBlock.innerHTML = `
                    <div class="block_spacing"></div>
                    <div class="block" id="${version.id}">
                        <div class="block_main wrap_flex">
                            <div>
                                <div class="title2 download_block_title">${version.title}</div>
                                ${version.logo ? `<div class="update_logo_area">
                                    <img alt="" class="update_logo" src="${rootPath}/images/update/logo/${version.logo}"/>
                                </div>` : ""}
                            </div>
                            <div class="update_artwork_area">
                                <img alt="" class="update_artwork" src="${rootPath}/images/update/artwork/${version.artwork}"/>
                            </div>
                        </div>
                        <div class="block_main wrap_flex">
                            <div class="download_block_description">${version.description}</div>
                            <div class="link_block_group">
                                <div class="link_block_group_title">下载</div>
                                <div class="wrap_flex">
                                    ${Object.entries(version.platform).map(([platformKey, platformName]) => `
                                    <link-block onclick="playSound('click');jumpToPage('${rootPath}/download/${edition}/versions.html?version=${version.id}&platform=${platformKey.toLowerCase()}');">
                                        <div class="link_title">
                                            <img alt="" class="link_title_img" src="${rootPath}/images/logo/${platformKey}.png"/>${platformName}
                                        </div>
                                    </link-block>`).join("")}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                sidebarBlock.innerHTML = `
                    <a class="sidebar_item" href="${window.location}#${version.id}"><article_list>${version.id}</article_list></a>
                `;

                // 添加到容器中
                mainContainer.appendChild(mainBlock);
                sidebarContainer.appendChild(sidebarBlock);
                setTimeout(replaceLoadingImages, 100); // 占位图逻辑
            });
            setTimeout(function () {
                mainHandleScroll(); // 联动自定义网页滚动条
            }, 10)
        })
        .catch(error => logManager.log("加载版本索引错误: " + error, 'error'));
}
