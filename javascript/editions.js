/*
 * Copyright © 2020-2024. Spectrollay
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
    console.log("显示免责声明弹窗");
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
    playSound(button);
    overlay.style.display = "none";
    modal.style.display = "none";
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