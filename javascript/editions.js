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

let openurl;

// 免责申明弹窗
function showDisclaimerModal(url) {
    const overlay = document.getElementById("overlay_disclaimer_modal");
    const modal = document.getElementById("disclaimer_modal");
    overlay.style.display = "block";
    modal.style.display = "block";
    logManager.log("显示免责声明弹窗");
    if (url === undefined) {
        openurl = null;
    } else {
        openurl = url;
    }
    modal.focus();
}

function hideDisclaimerModal(button, state, url) {
    const overlay = document.getElementById("overlay_disclaimer_modal");
    const modal = document.getElementById("disclaimer_modal");
    playSoundType(button);
    overlay.style.display = "none";
    modal.style.display = "none";
    if (state === -1) {
        logManager.log("选择了不同意");
    } else if (state === 1) {
        logManager.log("选择了同意并继续");
    }
    logManager.log("关闭免责声明弹窗");
    if (url !== null) {
        logManager.log("获取到跳转链接:" + url);
        if (state === 1) {
            if (url.includes('huang1111')) { // TODO 在移除全部相关链接后删除判定
                ifNavigating("open", "/minecraft_repository/default/error_not-found.html");
            } else {
                ifNavigating("open", url);
            }
        } else {
            ifNavigating("jump", url);
        }
        logManager.log("跳转成功");
    } else {
        logManager.log("无跳转链接", 'warn');
    }
}

function howToBuyGame(button, state, url) {
    playSoundType(button);
    if (state === 0) {
        logManager.log("选择了了解正版购买");
    }
    logManager.log("获取到跳转链接: " + url);
    ifNavigating("jump", url);
    logManager.log("跳转成功");
}