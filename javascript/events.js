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

// 时间函数
const currentDate = new Date();
let Y = currentDate.getFullYear();
let M = currentDate.getMonth() + 1;
let D = currentDate.getDate();
let h = currentDate.getHours();
let m = currentDate.getMinutes();
let s = currentDate.getSeconds();

// Y = 2025; // 年份全称
// M = 1; // 一位数不要补零
// D = 1; // 一位数不要补零
// h = 1; // 一位数不要补零

const currentSolar = Solar.fromYmd(Y, M, D);
const currentLunar = currentSolar.getLunar();

logManager.log("当前时间: " + Y + '/' + M + '/' + D + ' ' + h + ':' + m + ':' + s);
logManager.log("农历信息: " + currentLunar.toFullString());


// 灰白蒙版
(function () {
    const memorialDays = [
        [5, 12], // 汶川特大地震
        [7, 28], // 唐山大地震
        [12, 13] // 国家公祭日
    ];

    let isMemorialDay = false;
    for (const [memMonth, memDay] of memorialDays) {
        if (M === memMonth && D === memDay) {
            isMemorialDay = true;
            break;
        }
    }

    if (isMemorialDay) {
        document.documentElement.classList.add('grayscale');
    } else {
        document.documentElement.classList.remove('grayscale');
    }
})();


// Tip标语
const event_tip1 = document.getElementById('event_tip1');
const event_tip2 = document.getElementById('event_tip2');
let holiday_tip_display1 = event_tip1 ? event_tip1.querySelector('.banner') : null;
let holiday_tip_display2 = event_tip2 ? event_tip2.querySelector('.banner') : null;
if (event_tip1) event_tip1.style.display = 'none';
if (event_tip2) event_tip2.style.display = 'none';
if (holiday_tip_display1) holiday_tip_display1.innerHTML = '';
if (holiday_tip_display2) holiday_tip_display2.innerHTML = '';

// 农历节日
const lunarHolidayData = [
    {
        name: '春节',
        isCurrentDay: () => {
            // 春节 除夕至正月初八
            const lunarNewYearSolar = Lunar.fromYmd(Y, 1, 1, true).getSolar();
            const chineseNewYearEveSolar = lunarNewYearSolar.next(-1);
            const chineseNewYearEndDisplaySolar = lunarNewYearSolar.next(7);
            const eveDate = new Date(chineseNewYearEveSolar.getYear(), chineseNewYearEveSolar.getMonth() - 1, chineseNewYearEveSolar.getDay());
            const endDisplayDate = new Date(chineseNewYearEndDisplaySolar.getYear(), chineseNewYearEndDisplaySolar.getMonth() - 1, chineseNewYearEndDisplaySolar.getDay());
            const currentFullDate = new Date(Y, M - 1, D);
            return currentFullDate >= eveDate && currentFullDate <= endDisplayDate;
        },
        getTip: () => {
            if (Y === 2025) return '2025巳巳如意!';
            return `${Y}新年快乐!`;
        }
    },
    {
        name: '元宵节',
        isCurrentDay: () => currentLunar.getMonth() === 1 && currentLunar.getDay() === 15,
        getTip: () => '元宵快乐~'
    },
    {
        name: '端午节',
        isCurrentDay: () => currentLunar.getMonth() === 5 && currentLunar.getDay() === 5,
        getTip: () => '端午安康~'
    },
    {
        name: '中秋节',
        isCurrentDay: () => currentLunar.getMonth() === 8 && currentLunar.getDay() === 15,
        getTip: () => '中秋快乐~'
    }
];

// 公历节日
const solarHolidayData = [
    {
        name: '愚人节',
        isCurrentDay: () => M === 4 && (D === 1 || (D === 2 && h < 12)),
        getTip: () => {
            if (Y === 2026) return `<span></span>`; // TODO 即将到来
            return 'Happy Fools Day!';
        }
    },
    {
        name: '世界地球日', // 4月22日
        isCurrentDay: () => M === 4 && D >= 20 && D <= 25,
        getTip: () => {
            if (Y === 2026) return `<span></span>`; // TODO 即将到来
            return `<span>第${Y - 1969}个<a href="https://www.earthday.org" target="_blank">世界地球日</a></span>`;
        }
    },
    {
        name: '元旦',
        isCurrentDay: () => M === 1 && D === 1,
        getTip: () => 'Happy New Year!'
    },
    {
        name: '版本库周年纪', // 3月12日
        isCurrentDay: () => M === 3 && D >= 10 && D <= 16,
        getTip: () => `版本库${Y - 2020}周年纪!`
    },
    {
        name: 'Minecraft生日', // 5月17日
        isCurrentDay: () => M === 5 && D >= 15 && D <= 21,
        getTip: () => `${Y - 2009} Years of Minecraft!`
    },
    {
        name: '儿童节',
        isCurrentDay: () => M === 6 && D === 1,
        getTip: () => '无论你现在几岁,都祝你儿童节快乐!'
    },
    {
        name: '高考',
        isCurrentDay: () => M === 6 && D >= 6 && D <= 10,
        getTip: () => '高考加油!'
    },
    {
        name: '国庆节',
        isCurrentDay: () => M === 10 && D >= 1 && D <= 7,
        getTip: () => '国庆快乐!'
    },
    {
        name: '圣诞节',
        isCurrentDay: () => M === 12 && (D === 24 || D === 25),
        getTip: () => 'Merry Christmas!'
    }
];


// 农历节日显示逻辑
if (event_tip1 && holiday_tip_display1) {
    for (const holiday of lunarHolidayData) {
        if (holiday.isCurrentDay()) {
            event_tip1.style.display = 'flex';
            holiday_tip_display1.innerHTML = holiday.getTip();
            break;
        }
    }
}

// 公历节日显示逻辑
if (event_tip2 && holiday_tip_display2) {
    for (const holiday of solarHolidayData) {
        if (holiday.isCurrentDay()) {
            event_tip2.style.display = 'flex';
            holiday_tip_display2.innerHTML = holiday.getTip();
            break;
        }
    }
}
