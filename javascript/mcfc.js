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

// 颜色代码映射
const colorMap = {
    '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
    '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
    '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
    'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF',
    'g': '#DDD605', 'h': '#E3D4D1', 'i': '#CECACA', 'j': '#443A3B',
    'm': '#971607', 'n': '#B4684D', 'p': '#DEB12D', 'q': '#47A036',
    's': '#2CBAA8', 't': '#21497B', 'u': '#9A5CC6', 'v': '#EB7114'
};

// 样式代码映射
const styleMap = {
    'l': 'font-weight: bold;',
    'M': 'text-decoration: line-through;',
    'N': 'text-decoration: underline;',
    'o': 'font-style: italic;',
};

// 字符宽度分组池
const charPools = {
    'charWidth1': "',.:;i|! `l",
    'charWidth2': "*-I[]jt\"()<>fk{}",
    'charWidth3': "$%&+/0123456789=?ABCDEFGHJKLMNOPQRSTUVWXYZ\\^_abcdeghmnopqrsuvwxyz",
    'charWidth4': "@~"
};

// 构建字符 => 宽度类名映射表
const charToWidthClassMap = Object.fromEntries(
    Object.entries(charPools).flatMap(([cls, chars]) => chars.split('').map(c => [c, cls]))
);

const fallbackCharWidthMap = {};

// 统计各宽度组权重
function calculateWidthGroupWeights() {
    const total = Object.values(charPools).reduce((sum, pool) => sum + pool.length, 0);
    return Object.fromEntries(Object.entries(charPools).map(([group, pool]) => [group, pool.length / total]));
}

// 按权重随机选择一个宽度组(根据字符池长度)
function selectWidthGroupByWeight(weights) {
    const rand = Math.random();
    let cumulativeWeight = 0;

    for (const [group, weight] of Object.entries(weights)) {
        cumulativeWeight += weight;
        if (rand <= cumulativeWeight) {
            return group;
        }
    }

    return Object.entries(weights).reduce((a, b) => a[1] > b[1] ? a : b)[0]; // 防止浮点误差
}

// 获取字符宽度组(未知字符随机选并缓存)
function getCharWidthClass(c) {
    if (charToWidthClassMap[c]) return charToWidthClassMap[c];
    if (fallbackCharWidthMap[c]) return fallbackCharWidthMap[c];

    const weights = calculateWidthGroupWeights();
    const randomWidth = selectWidthGroupByWeight(weights);
    fallbackCharWidthMap[c] = randomWidth;
    return randomWidth;
}

// 获取与宽度相近的随机字符(用于§k乱码)
function getRandomChar(baseChar) {
    const widthClass = getCharWidthClass(baseChar);
    const pool = charPools[widthClass] || charPools['charWidth3'];
    return pool[Math.floor(Math.random() * pool.length)] || ' ';
}

// 颜色缓存
const colorCache = {
    rgb: new Map(),
    hex: new Map()
};

// 将颜色字符串转为十六进制并缓存
function parseColorToHex(color) {
    if (color.startsWith('#')) return color.length === 7 ? color.toUpperCase() : null;

    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
        const [r, g, b] = match.slice(1).map(Number);
        return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    return null;
}

function parseColorToHexCached(color) {
    if (colorCache.hex.has(color)) return colorCache.hex.get(color);
    const hex = parseColorToHex(color);
    colorCache.hex.set(color, hex);
    return hex;
}

// 将颜色转为RGB数组并缓存
function parseColorToRGB(color) {
    if (color.startsWith('#') && color.length === 7) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return [r, g, b];
    }
    const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) return match.slice(1).map(Number);
    return null;
}

function parseColorToRGBCached(color) {
    if (colorCache.rgb.has(color)) return colorCache.rgb.get(color);
    const rgb = parseColorToRGB(color);
    colorCache.rgb.set(color, rgb);
    return rgb;
}

// 根据颜色判断描边颜色
function getStrokeColor(color) {
    const rgb = parseColorToRGBCached(color);
    if (!rgb) return '#000000';
    const [r, g, b] = rgb;
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    return brightness < 128 ? '#FFFFFFCC' : '#000000CC';
}

// 将带有§代码的字符串解析为HTML结构
function parseMinecraftText(text, defaultColor) {
    const container = document.createElement("span");
    let currentColor = `color: ${defaultColor};`;
    let strokeColor = getStrokeColor(defaultColor);
    let currentStyles = '';
    let obfuscated = false;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '§' && i + 1 < text.length) {
            const code = text[++i];
            if (colorMap[code]) {
                const hex = colorMap[code];
                strokeColor = getStrokeColor(hex);
                currentColor = `color: ${hex};`;
                currentStyles = ''; // 颜色代码重置所有样式
                obfuscated = false; // 颜色代码重置乱码状态
            } else if (styleMap[code]) {
                // 设置下划线和删除线的颜色(与描边颜色相同)
                if (code === 'M' || code === 'N') {
                    currentStyles += styleMap[code] + `text-decoration-color: ${parseColorToHexCached(defaultColor)};`;
                } else {
                    currentStyles += styleMap[code];
                }
            } else if (code === 'r') {
                // 重置样式
                currentColor = `color: ${defaultColor};`;
                strokeColor = getStrokeColor(defaultColor);
                currentStyles = '';
                obfuscated = false;
            } else if (code === 'k') {
                // 启用乱码
                obfuscated = true;
            }
            continue;
        }

        // 处理空格字符
        if (text[i] === ' ') {
            const spaceSpan = document.createElement("span");
            spaceSpan.textContent = "\u00A0";  // HTML的空格符号为&nbsp;
            container.appendChild(spaceSpan);
            continue;
        }

        // 创建两个嵌套元素以支持描边和乱码
        const outerSpan = document.createElement("span");
        const innerSpan = document.createElement("span");

        outerSpan.style.cssText = `paint-order: stroke; -webkit-text-stroke: 0.03em ${strokeColor}; display: inline-block;`;
        innerSpan.style.cssText = currentColor + currentStyles;

        if (obfuscated) {
            const widthClass = getCharWidthClass(text[i]);
            outerSpan.classList.add("randomChar", widthClass);
            outerSpan.dataset.char = text[i]; // 保存原字符用于乱码还原
            innerSpan.textContent = getRandomChar(text[i]);
        } else {
            innerSpan.textContent = text[i];
        }

        outerSpan.appendChild(innerSpan);
        container.appendChild(outerSpan);
    }

    return container;
}

// 渲染页面中所有class名为mcfc的元素
function renderAllMinecraftText() {
    document.querySelectorAll('.mcfc').forEach(element => {
        const rawText = element.dataset.rawText || element.textContent;
        element.dataset.rawText = rawText;
        const defaultColor = getComputedStyle(element).color; // 获取当前元素默认颜色
        const parsed = parseMinecraftText(rawText, defaultColor);
        element.innerHTML = '';
        element.appendChild(parsed);
    });
}

// 每30ms更新一次乱码字符
setInterval(() => {
    document.querySelectorAll(".randomChar").forEach(element => { // element是外部元素
        const baseChar = element.dataset.char || "a";
        if (element.firstChild && element.firstChild.nodeName === 'SPAN') { // 确保内部元素存在
            element.firstChild.textContent = getRandomChar(baseChar);
        }
    });
}, 30);

// 初始渲染
window.addEventListener('load', renderAllMinecraftText);
