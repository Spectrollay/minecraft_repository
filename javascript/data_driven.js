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

// 友链
(async function () {
    let reciprocal_links;
    if (hostPath.includes('https')) {
        reciprocal_links = data + '/minecraft_repository' + '/reciprocal_links.json';
    } else {
        reciprocal_links = rootPath + '/data/reciprocal_links.json';
    }
    try {
        const response = await fetch(reciprocal_links);
        let rawJson = await response.text(); // 获取原始文本
        const cleanedJson = rawJson.replace(/ \/\/.*|\/\*[\s\S]*?\*\//g, '').trim(); // 移除注释
        const data = JSON.parse(cleanedJson); // 解析为JSON对象
        const container = document.getElementById('reciprocal_link_list');
        if (container) {
            container.innerHTML = '';
            data.forEach(link => {
                const block = document.createElement('link-block');
                block.className = 'reciprocal_link_block';
                block.setAttribute('onclick', `playSound('click');openLink('${link.url}');`);
                block.innerHTML = `
                    <div class="link_title">
                        <img alt="" class="link_title_img" loading="lazy" src="${link.img}">
                        <span class="link_title_text">${link.name}</span>
                    </div>
                    <div class="link_description">${link.desc}</div>
                `;
                container.appendChild(block);
                setTimeout(replaceLoadingImages, 100); // 占位图逻辑
            });
        }
    } catch (error) {
        logManager.log("友链加载失败: " + error, 'error');
    }
})();

// 捐赠列表
(async function () {
    let donors;
    if (window.location.origin.includes('https')) {
        donors = data + '/minecraft_repository' + '/donors.json';
    } else {
        donors = rootPath + '/data/donors.json';
    }
    try {
        const response = await fetch(donors);
        let rawJson = await response.text(); // 获取原始文本
        const cleanedJson = rawJson.replace(/ \/\/.*|\/\*[\s\S]*?\*\//g, '').trim(); // 移除注释
        const data = JSON.parse(cleanedJson); // 解析为JSON对象
        const container = document.getElementById('donate_list');
        if (container) {
            data.forEach(entry => {
                const block = document.createElement('tr');
                block.className = 'donor_list';
                block.innerHTML = `
                    <td class="donor_name">${entry.user}</td>
                    <td class="donor_amount">${entry.amount}</td>
                `;
                container.appendChild(block);
            });
        }
    } catch (error) {
        logManager.log("捐赠列表加载失败: " + error, 'error');
    }
})();