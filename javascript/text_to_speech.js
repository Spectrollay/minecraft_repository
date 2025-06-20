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

// TTS文本转语音
let enable_tts;
enable_tts = false;
if (enable_tts) {
    useTTS();
}

function useTTS() {
    if ('speechSynthesis' in window) {
        // 支持TTS
        let currentUtterance = null;
        let lastText = '';

        function speakText(text) {
            if (text === lastText) return; // 如果目标文本没有改变
            lastText = text;

            if (currentUtterance) {
                window.speechSynthesis.cancel();
            }

            currentUtterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(currentUtterance);
        }

        function handleEvent(event) {
            const text = event.target.innerText.trim();
            if (text) {
                speakText(text);
            }
        }

        document.addEventListener('mouseover', handleEvent);
        document.addEventListener('touchstart', handleEvent, {passive: true});

        window.addEventListener('unload', () => {
            window.speechSynthesis.cancel(); // 页面卸载时取消未完成的语音任务
        });
    } else {
        // 不支持TTS
        logManager.log("当前浏览器不支持TTS文本转语音", 'warn');
    }
}

// Screen Reader屏幕阅读器
let element;
if (element) {
    element.setAttribute('role', 'main');
    element.setAttribute('aria-hidden', true);
}
