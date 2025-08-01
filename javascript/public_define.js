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

// 版本变量
// TODO 需在每次提交前检查
const main_version_name = '4';
const primary_version_name = main_version_name + '.6'; // 例 4.0
const secondary_version_name = primary_version_name + '.7'; // 例 4.0.0
const version_name_short = secondary_version_name + '.8'; // 例 4.0.0.1  NOTE 小版本
const version_type = 'Stable'; // Preview/Insider_(Preview/Alpha/Beta)/Canary/Alpha/Beta/Pre/RC/Stable/Release/SP
const version_type_count = version_type + ''; // 例 Build1  NOTE 小版本编号
const version_name = version_name_short + '.' + version_type; // 例 4.0.0.1.Build
const version_nickname = secondary_version_name + '-' + version_type_count; // 例 4.0.0-Build1
const update_count = '20250801' + '.01'; // NOTE 小版本,有更改版本的提交就变
const publish_version_name = primary_version_name + '.' + update_count; // 例 4.20240101.01
const server_version = '4.0';
let commit = '#'; // 例 #2025010101 , 仅留 # 则从 update_count 提取  NOTE 提交编号,有不更改版本的提交就变
if (commit === '#') {
    commit = '#' + update_count.replace(/\./g, '');
}

rootPath = '/' + (window.location.pathname.split('/').filter(Boolean).length > 0 ? window.location.pathname.split('/').filter(Boolean)[0] : '');
hostPath = window.location.origin;
switchValues = JSON.parse(localStorage.getItem(`(${rootPath}/)switch_value`)) || {};
let data = hostPath + '/data';

async function getProjectHash() {
    try {
        const response = await fetch(rootPath + '/Verification/project-hash.json');
        if (response.ok) {
            const hash = await response.json();
            return hash.projectHash;
        } else {
            logManager.log("获取项目哈希值时出错: " + response.status, 'error');
            return null;
        }
    } catch (error) {
        logManager.log("获取项目哈希值时发生异常: " + error.message, 'error');
        return null;
    }
}

// 版本信息
let version_info = `
    <table>
        <tr><td colspan='2' style='text-align: center'>版本信息</td></tr>
        <tr><td class="left_td">主要更新: </td><td class="right_td">${primary_version_name}</td></tr>
        <tr><td class="left_td">次要更新: </td><td class="right_td">${secondary_version_name}</td></tr>
        <tr><td class="left_td">版本编号: </td><td class="right_td">${version_name_short}</td></tr>
        <tr><td class="left_td">版本类型: </td><td class="right_td">${version_type}</td></tr>
        <tr><td class="left_td">版本名称: </td><td class="right_td">${version_name}</td></tr>
        <tr><td class="left_td">版本别称: </td><td class="right_td">${version_nickname}</td></tr>
        <tr><td class="left_td">发布编号: </td><td class="right_td">${update_count}</td></tr>
        <tr><td class="left_td">最后提交: </td><td class="right_td">${commit}</td></tr>
        <tr></tr>
        <tr><td colspan='2' style='text-align: center'>校验码</td></tr>
        <tr><td colspan='2' id="project_hash" style='text-align: center'>获取数据中</td></tr>
    </table>
`;

// 项目校验
getProjectHash().then(projectHash => {
    const projectHashElement = document.getElementById('project_hash');
    if (projectHashElement) {
        if (projectHash) {
            projectHashElement.textContent = projectHash;
        } else {
            projectHashElement.textContent = '获取数据失败';
        }
    }
});

logManager.log("发布版本: " + publish_version_name);

// 网站状态
let status;
if (hostPath.includes('https')) {
    status = data + rootPath + '/status.xml';
} else {
    status = rootPath + '/data/status.xml';
}

fetch(status)
    .then((response) => response.text())
    .then((xmlText) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

        // 检查XML是否解析成功
        if (xmlDoc.querySelector('parsererror')) {
            logManager.log("状态配置解析错误: " + xmlDoc.querySelector('parsererror').textContent, 'warn');
            return;
        }

        // 提取配置数据并处理
        const siteStatus = xmlDoc.querySelector('site_status').textContent.trim();
        const isShowModal = xmlDoc.querySelector('is_show_modal').textContent.trim();
        const showModalTimes = parseInt(xmlDoc.querySelector('show_modal_times')?.textContent.trim() || '0', 10); // 获取弹窗显示次数
        const currentUrl = encodeURIComponent(window.location.href);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('redirected')) {
            return;
        }

        // 获取状态码
        switch (siteStatus) {
            case 'error':
                location.replace(`${rootPath}/default/error_default.html?redirected=true&source=${currentUrl}`);
                return;
            case 'warn':
                location.replace(`${rootPath}/default/under_maintenance.html?redirected=true&source=${currentUrl}`);
                return;
            case '404':
                location.replace(`${rootPath}/404.html?redirected=true`);
                return;
            case '200':
                break;
            default:
                logManager.log("未知的网站状态: " + siteStatus + "\n请添加判定或修改配置", 'warn');
        }

        // 获取弹窗数据
        if (isShowModal === '1') {
            const modalConfig = xmlDoc.querySelector('modal_config').textContent.trim();
            const parser = new DOMParser();
            const modalDoc = parser.parseFromString(modalConfig, 'text/html'); // 解析为HTML文档
            const overlayElement = modalDoc.querySelector('.overlay');
            const modalAreaElement = modalDoc.querySelector('modal_area');

            if (!overlayElement || !modalAreaElement) {
                logManager.log("无法从配置中解析弹窗,请检查配置", 'error');
                return;
            }

            if (showModalTimes > 0) {
                const modalDisplayedCount = parseInt(sessionStorage.getItem('modal_displayed_count') || '0', 10);
                if (modalDisplayedCount >= showModalTimes) {
                    logManager.log("弹窗显示次数已达上限,不显示");
                    return;
                }
                sessionStorage.setItem('modal_displayed_count', modalDisplayedCount + 1);
            }

            document.body.appendChild(overlayElement);
            document.body.appendChild(modalAreaElement);
            overlayElement.style.display = 'block';
            modalAreaElement.style.display = 'block';
            modalAreaElement.focus(); // 将焦点聚集到弹窗上,防止选中弹窗下方元素
            logManager.log("显示弹窗: " + modalAreaElement.id);
        }
    })
    .catch((error) => {
        logManager.log("加载状态配置文件时出错: " + error, 'error');
    });

// 字符常量
const texts = {
    sidebar_bottom_title: 'Minecraft Kit',
    sidebar_bottom_detail1: '© 2020 Spectrollay',
    minecraft_wiki: '中文Minecraft Wiki',
    experiment_banner: '实验性内容页面展示的是一部分未完成开发或正在开发的特性, 这些特性最终可能会在未来版本中正式加入或发生变动甚至被移除.<br>请注意: 本页面的特性尚未完成开发, 使用过程中随时可能出现故障/崩溃或一些预料之外的问题. 向我们发送你的任何意见或反馈发现的任何问题!',
    download_channel1_old: '默认云盘',
    download_channel2_old: '蓝奏云盘',
    download_channel3_old: '123云盘',
    download_channel4_old: '天翼云盘',
    download_channel5_old: '百度云盘',
    download_channel6_old: `<img alt='' class='link_img_black' src='images/ExternalLink.png'/>外部链接`,
    download_channel1: 'OneDrive',
    download_channel2: '百度网盘',
    download_channel3: '夸克网盘',
    download_channel4: '123云盘',
    download_channel5: '蓝奏云',
    download_channel6: 'huang1111网盘',
    download_channel7: `<img alt='' class='link_img_black' src='images/ExternalLink.png'/>外部链接`,
    download_type1: '官方原版',
    download_type1_out: `<img alt='' class='link_img_black' src='images/ExternalLink.png'/>官方原版(外部链接)`,
    download_type2: '中文译名修正',
    download_type3: '去验证版',
    download_type4: '多架构版',
    download_type5: '精简版',
};

let isRelease = (version_type === 'Beta' || version_type === 'Pre' || version_type === 'RC' || version_type === 'Release' || version_type === 'Stable' || version_type === 'SP');
let isFullVersion = (version_type !== 'Demo' && version_type !== 'Trial' && version_type !== 'Lite');
let isAllTip = switchValues['all_tip'] || 'off';
let mode;
if (version_type === 'Demo') {
    mode = '演示';
} else if (version_type === 'Trial') {
    mode = '试用';
} else if (version_type === 'Lite') {
    mode = '精简';
}

let previousTipIndex = -2;
let currentTipIndex = -1;
const tipElement = document.getElementById('banner_tip');
let tipsWithWeights;
const commonTips = [
    {
        text: `<span>发现问题或有好的建议?<a href='/minecraft_repository/about/contact.html' target='_blank'>欢迎提出</a>!</span>`,
        weight: 10
    },
    {
        text: `<span>想和大家一起闲聊吹水?<br>快加入 <a href='https://t.me/Spectrollay_MCW' target='_blank'>Telegram</a> | <a href='https://qm.qq.com/q/AqLmKLH9mM' target='_blank'>QQ</a> | <a href='https://yhfx.jwznb.com/share?key=VyTE7W7sLwRl&ts=1684642802' target='_blank'>云湖</a> 群聊!</span>`,
        weight: 10
    },
    {
        text: `<span>欢迎加入版本库官方频道: <a href='https://t.me/spectrollay_minecraft_repository' target='_blank'>Telegram</a> | <a href='https://pd.qq.com/s/h8a7gt2u4' target='_blank'>QQ</a></span>`,
        weight: 10
    },
    {
        text: `<span>记住我们的<a href='https://github.com/Spectrollay/minecraft_repository/' target='_blank'>官方网站</a>!</span>`,
        weight: 10
    },
    {
        text: `<span>也来看看我们的<a href='https://spectrollay.github.io/mclang_cn/' target='_blank'>Minecraft基岩版中文译名修正项目</a>!</span>`,
        weight: 10
    },
    {
        text: `<span>也来看看我们的<a href='https://spectrollay.github.io/minecraft_formatting_code_online/' target='_blank'>Minecraft格式化代码渲染器</a>!</span>`,
        weight: 10
    },
    {text: 'Made by Spectrollay!', weight: 10},
    {text: '← 点击框框内部可以切换提示标语 →', weight: 10},
    {text: '↑ 点击标题栏可以快速回到顶部 ↑', weight: 10},
    {text: '本站指向的站外内容可能不受保障!', weight: 10},
    {text: '请直接分享本站而不是转载其中的内容!', weight: 10},
    {text: '你知道吗,正是像你这样的玩家创造了无限的社区！', weight: 10},
    {text: '感谢你使用星月Minecraft版本库!', weight: 10},
];
const fullVersionTips = [
    {text: '你完成你的事情了吗?', weight: 5},
    {text: '你最好已经购买了正版游戏!', weight: 5},
    {text: '我们保留了一些bug,这样你才知道你在使用的是星月Minecraft版本库.', weight: 5},
    {text: '你知道吗,你知道吗?', weight: 5},
    {text: '你知道吗,版本库的第一个版本仅用了两天时间构建.', weight: 5},
    {text: '你知道吗,这个项目始于2020年.', weight: 5},
    {text: '你知道吗,你可以参与这个项目的开发与维护.', weight: 5},
    {text: '你知道吗,一万行代码需要三个月的时间来实现,而删掉它们只需要三秒.', weight: 5},
    {text: '我想你应该会喜欢彩蛋的!', weight: 5},
    {text: '现在实现彩蛋自由了!', weight: 5},
    {text: '加载提示标语时遇到问题,请点击重试.', weight: 5},
    {text: '现在你看到了一条提示标语.', weight: 5},
    {text: '猜一猜下一条出现的提示标语是什么?', weight: 5},
    {text: '猜一猜下一次看到这条提示标语是什么时候?', weight: 5},
    {text: '是谁把我放在这的?', weight: 5},
    {text: 'Herobrine已移除!', weight: 5},
    {text: '创意无极限!', weight: 5},
    {text: '我们DNA里的氮元素,牙齿里的钙元素,血液里的铁元素,还有苹果派里的碳元素,都源自大爆炸时崩裂的万千恒星.我们都是星辰.', weight: 5},
    {text: '不妨试着点点我?你可能会发现什么.', weight: 5},
    {text: '网页\"星月Minecraft版本库\"没有响应', weight: 5},
    {text: '版本库是这样的,开发者只要更新版本就可以了,而用户要考虑的事情就很多了.', weight: 5},
    {text: '我的出租屋里真的有很多蟑螂，但我认识的MC玩家真的没有几个.', weight: 5},
    {text: '有一个人前来下载MC.', weight: 5},
    {text: 'Minecraft, 启动!', weight: 5},
    {text: '看到这条提示标语就去启动Minecraft吧!', weight: 5},
    {text: '也去玩玩Minceraft吧!', weight: 5},
    {text: '也去玩玩饥荒吧!', weight: 5},
    {text: '也去玩玩泰拉瑞亚吧!', weight: 5},
    {text: '触摸设备友好型!', weight: 5},
    {text: '不要这样看着人家,会害羞的啦!', weight: 5},
    {text: '不要一直戳人家啦!', weight: 5},
    {text: '今天是一个不错的日子,你说对吗?', weight: 5},
    {text: '你有些事情需要在今天结束的时候考虑一下...', weight: 5},
    {text: '你看到了这条提示标语,这使你充满了决心.', weight: 5},
    {text: `<span>人生将从此展开新的一页.<br>...但前途必然是光明的!</span>`, weight: 5},
    {text: '背上行囊出发吧,去触摸山川湖海的心跳.', weight: 5},
    {text: '什么Bug?哪里有Bug?你不要乱讲,那是特性!', weight: 5},
    {text: '完全随机的提示标语!', weight: 5},
    {text: '多抬头看看天空吧!', weight: 5},
    {text: '别怕,有光.', weight: 5},
    {text: '天空即为极限!', weight: 5},
    {text: '记得要天天开心哦!', weight: 5},
    {text: '今天辛苦了!加油!', weight: 5},
    {text: '不要泄气,你真的很棒!', weight: 5},
    {text: '很高兴看到你!', weight: 5},
    {text: '劳逸结合!', weight: 5},
    {text: '持续支持中!', weight: 5},
    {text: '独一无二的设计!', weight: 5},
    {text: '生命是物质能量与信息的统一体.', weight: 5},
    {text: '客观的规律都是通过一定的科学概念去认识和表达的,而且这些概念本身,就在一定程度上反映着规律的本质.', weight: 5},
    {text: 'Technoblade never dies!', weight: 5},
    {text: 'Hello world!', weight: 5},
    {text: '95% OreUI!', weight: 5},
    {text: '90% bug free!', weight: 5},
    {text: 'Powered by AI!', weight: 5},
    {text: 'Are you OK?', weight: 5},
    {text: 'wake up', weight: 5},
    {text: '/give @a hugs 64', weight: 5},
    {text: 'sqrt(-1) love you!', weight: 5},
    {text: 'P不包含NP!', weight: 5},
    {text: 'Creeper?', weight: 5},
    {text: 'Aww man!', weight: 5},
    {text: 'Hmmmrmm!', weight: 5},
    {text: 'Ssssss...BOOM!', weight: 5},
    {text: 'Nooooooooooooo!', weight: 5},
    {text: `<span>Who are you?<br>I'm Steve!</span>`, weight: 5},
    {text: 'Everybody do the Leif!', weight: 5},
    {text: 'What DOES the fox say?', weight: 5},
    {text: '!!!1!', weight: 5},
    {text: 'llI1IlI11lllI', weight: 5},
    {text: 'Wow!', weight: 5},
    {text: '袜袄--------!!', weight: 5},
    {text: '警告: 版本库里没有红色的开关!如果在使用过程中发现了红色的开关,请!立刻!关闭!网页!并喝!一杯!热水!', weight: 5},
    {text: '崩溃这种事情不要啊!', weight: 5},
    {text: '像幽匿尖啸体一样尖啸!', weight: 5},
    {text: '你做完你的作业了吗?', weight: 5},
    {text: '末影人把我的作业偷走了!', weight: 5},
    {text: '苦力怕把我的作业炸了!', weight: 5},
    {text: `<br>`, weight: 2},
    {text: '← To Be Continued...', weight: 2},
    {text: '\"好久不见\"', weight: 2},
    {text: '别杀怪物,你这个海豚!', weight: 2},
    {text: '你要去码头整点薯条吗?', weight: 2},
    {text: '真的会有人看这些吗?', weight: 2},
    {
        text: `<span style='background: linear-gradient(to right, #1C0DFF, #3CBBFC, #B02FED, #FF57AC, #FFB515, #FFEA45, #99FF55, #00FFAA); -webkit-background-clip: text; background-clip: text; color: transparent;'>这是一条彩色的提示标语!</span>`,
        weight: 2
    },
    {
        text: `<span style='transform: scaleX(-1) scaleY(-1);'>这是一条颠倒的提示标语!</span>`,
        weight: 2
    },
    {text: '点我抽盲盒!', weight: 2},
    {text: '这里,是梦开始的地方...', weight: 1},
    {text: '那是一个下午,你像往常一样打开了Minecraft.那时的你怎么也不会想到,此后你再也没有进入过方块世界了...', weight: 1},
    {text: '那天,你做了一场梦,看到了那扇永远没能打开的天堂门...', weight: 1},
    {text: `<span style='color: dodgerblue'>获得物品: 雷石东直放站!</span>`, weight: 1},
    {text: `<span style='color: dodgerblue'>获得物品: 雷霆之杖!</span>`, weight: 1},
    {text: `<span style='color: dodgerblue'>获得物品: 试用密钥!</span>`, weight: 1},
    {text: `<span style='color: dodgerblue'>获得物品: 羊驼唾沫!</span>`, weight: 1},
    {text: `<span style='color: dodgerblue'>驯服宠物: 六角恐龙!</span>`, weight: 1},
    {text: `<span style='color: gold'>获得稀有物品: 附魔金苹果!</span>`, weight: 0.1},
    {text: `<br><br><br><br><br><br><br><br><br><br><br><br>`, weight: 0.01},
    {text: `<span> - 曲终人散,黄粱一梦.玩家开始了新的梦境,玩家再次做起了梦,更好的梦.玩家就是宇宙.玩家就是爱.<br> - 你就是那个玩家.<br> - 该醒了.</span>`, weight: 0.01},
    {text: `<span> - 二十年之后,更令你懊悔的不是你做了什么,而是你没做什么.所以解开帆索,离开安全的港湾,赶着航程中的信风,去探索,去梦想,去发现.</span>`, weight: 0.01},
    {text: `<span style='color: yellow'>解锁隐藏成就: 仓库尽头的提示标语</span>`, weight: 0.001},
    {text: '这是一条永远不会出现的提示标语.', weight: 0},
];

const addTips = (newTips, oldTips) => {
    tipsWithWeights = [...newTips, ...oldTips];
};

const replaceTips = (newTips) => {
    tipsWithWeights = [...newTips];
};

const testTips = [
    {text: '很高兴你能够加入测试!', weight: 10},
    {text: '你当前使用的是开发仓库!', weight: 10},
    {text: '开发版本并不代表最终品质!', weight: 10},
    {text: '发现了漏洞?快来向我们反馈吧!', weight: 10},
    {text: '你觉得我们有什么需要改进的地方吗?', weight: 10},
    {text: '我们想听听你对新功能的想法!快来告诉我们吧!', weight: 10},
    {text: '想和我们聊聊?加入官方频道或群组与开发者交流!', weight: 10},
    {text: '想要退出测试?前往设置页面选择退出.期待你的下次加入!', weight: 10},
    {text: '想要贡献自己的代码?你可以在Github上协助我们一起开发!', weight: 10},
    {text: '我们欢迎你的反馈!前往项目仓库提交或直接向开发者汇报你的发现!', weight: 10},
    {text: '不要担心漏洞!开发仓库中发现的问题往往会在发布仓库更新前得以解决.', weight: 10},
    ...commonTips];

if (isRelease) {
    tipsWithWeights = [...commonTips, ...fullVersionTips];
} else {
    if (isAllTip === 'on') {
        addTips(testTips, fullVersionTips);
    } else {
        replaceTips(testTips);
    }
}

const notFullVersionTips = [
    {text: `你当前使用的是${mode}模式!`, weight: 10},
    {text: `要想体验完整的版本库功能,你需要退出${mode}模式.`, weight: 10},
    {text: `在退出${mode}模式时遇到了问题?加入官方频道或群组进行咨询!`, weight: 10},
    ...commonTips];

if (!isFullVersion) {
    replaceTips(notFullVersionTips);
    if (version_type === 'Demo') {
        addTips([
            {text: '演示模式仅供演示使用,无法调用版本库核心功能!', weight: 10},
        ], notFullVersionTips);
    } else if (version_type === 'Trial') {
        addTips([
            {text: '试用模式缺少部分版本库核心功能!', weight: 10},
            {text: '试用模式在部分功能上有所限制!', weight: 10},
            {text: '试用模式将会在一定期限后到期!', weight: 10},
        ], notFullVersionTips);
    } else if (version_type === 'Lite') {
        addTips([
            {text: '精简模式提供了极简的版本库设计,适合喜欢简单的你!', weight: 10},
            {text: '精简模式拥有大多数的版本库核心功能,但是诸如个性化等功能将不受支持!', weight: 10},
            {text: '在精简模式下部分完整版本的特性将会受到限制或无法使用!', weight: 10},
        ], notFullVersionTips);
    }
}

const downloadTips = [
    {text: '请直接分享本站而不是转载其中的内容!', weight: 10},
    {text: '你最好已经购买了正版游戏!', weight: 10},
    {text: '本站提供的安装包资源仅供正版玩家学习 / 研究或欣赏, 不得传播 / 出售或用于其他任何商业或非商业用途!', weight: 10},
    {text: '本站的所有安装包资源未经允许禁止传播!', weight: 10},
    {text: '请在24小时内删除从本站下载到的安装包!', weight: 10},
    {text: '指向的下载链接错误或失效?请通过右上角联系我们按钮向我们反馈!', weight: 10},
    {text: '下载到的文件有问题?点击右上角联系我们按钮向我们反馈!', weight: 10},
    {text: '使用本站即代表你已同意版本库的使用条款与免责声明.', weight: 10},
    {text: '你知道吗,你可以协助我们共同维护版本库的数据库资源.', weight: 10},
];

if (window.location.href.includes('download/')) {
    replaceTips(downloadTips);
}

if (hostPath.includes('file:///') || hostPath.includes('localhost')) {
    logManager.log("LocalStorage数据");
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        logManager.log("[" + [i + 1] + "]" + " " + key + ': ' + value);
    }
    if (localStorage.length === 0) {
        logManager.log("没有数据");
    }
}

logManager.log("加载常量和变量完成");

// 为按钮赋值
const wikiTexts = document.getElementsByClassName('wiki');
if (wikiTexts) {
    for (let i = 0; i < wikiTexts.length; i++) {
        wikiTexts[i].innerHTML = texts.minecraft_wiki;
    }
} else {
}

const setElementText = (elementId, text) => {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = text;
    } else {
    }
}

// 彩蛋标题(旧) TODO 旧页面完成迭代后移除
const repositoryLogo = document.getElementById('repository_logo');
if (repositoryLogo) {
    const randomValue = Math.floor(Math.random() * 10000); // 0.01%
    if (randomValue < 1) {
        repositoryLogo.innerHTML = '星月Minceraft版本库';
    } else {
        repositoryLogo.innerHTML = '星月Minecraft版本库';
    }
}

// 彩蛋标题
const StarmoonTitleShort = document.getElementById('starmoon_title_short');
const StarmoonTitleLong = document.getElementById('starmoon_title_long');
const randomValue = Math.floor(Math.random() * 1000); // 0.1%

if (StarmoonTitleShort && StarmoonTitleLong) {
    if (randomValue < 1) {
        StarmoonTitleShort.src = rootPath + '/images/logo/Starmoon_title_ee.png';
        StarmoonTitleLong.src = rootPath + '/images/logo/Starmoon_title_long_ee.png';
    } else {
        StarmoonTitleShort.src = rootPath + '/images/logo/Starmoon_title.png';
        StarmoonTitleLong.src = rootPath + '/images/logo/Starmoon_title_long.png';
    }
}

// 常见内容赋值
setElementText('sidebar_bottom_title', texts.sidebar_bottom_title);
setElementText('sidebar_bottom_detail1', texts.sidebar_bottom_detail1);
setElementText('setting_version', version_name_short);
setElementText('setting_version_detail', version_info);
setElementText('experiment_banner', texts.experiment_banner);

const support_message = document.getElementById('support_message');
if (support_message) {
    support_message.innerHTML = `
    <span>在2020年, 我们发布了第一个公开版本, 版本库的故事由此而起. 当时, 我们的想法只是做一个好的游戏分享平台, 这些年过去了, 我们仍在坚持. 但我们也深知, 为爱发电并不能长久, 因此我们一直在积极寻求能够稳定发展的道路. 如果你认为本站对你有所帮助, 不妨通过以下页面了解如何支持我们, 助力我们进一步发展.</span>
    `;
}

const donate_message = document.getElementById('donate_message');
if (donate_message) {
    donate_message.innerHTML = `
    <div>
        <p>我们深知这个版本库还很不尽人意, 界面简陋, 功能稀少, 甚至可能还有一堆的问题. 因此我们一直在不断地完善改进它, 希望能给每一个使用版本库的你, 带来更好的体验.</p>
        <p>如果你喜欢它, 且已经实现了经济独立, 可以考虑通过捐赠来支持我们. 这可以在很大程度上用于提升环境配置及开发积极性. 否则请你不要打赏, 分享与宣传也是对我们的强有力的支持.</p>
    </div>`;
}

const acknowledgments = document.getElementById('acknowledgments');
if (acknowledgments) {
    acknowledgments.innerHTML = `
    <div>
        <p>这是一个始于2020年的项目, 做它的初衷, 只是为了给我玩的为数不多的游戏一个版本留档, 当时这还只是一个私有项目, 并不对外开放.</p>
        <p>后来, 渐渐的我发现有许多人, 因为各种各样的原因, 有心购买游戏却无力, 亦或是需要某个特定的版本来完成特定的事, 在网上苦苦寻找却不得. 我想, 既然我有这些资源, 为什么不公开出来供大家一起使用呢? 这便是版本库对外开放的契因.</p>
        <p>在最早的时候, 版本库只是一个共享文档, 从V1开始, 经历了默认HTML样式到仿Knowledge Base样式再到OreUI样式, 一点点完善一点点进步, 才形成了现在的模样. 这一路的坎坷何谈容易, 其中还不乏因为各种各样的原因导致的数据丢失及被迫停更, 但好在最终都坚持下来了.</p>
        <p>所以啊, 最应该感谢的是每一个使用版本库支持版本库的你. 正因为有你们的支持与陪伴, 版本库才会坚持做下去, 走向未来. 没有你们, 就不会有版本库的今天.</p>
    </div>`;
}

const pageInfo = document.getElementById('page_info');
if (pageInfo) {
    pageInfo.innerHTML = `
    <div>
        <div class="page_info"><br></div>
        <div class="page_info_title">INFORMATION</div>
        <div class="page_info"><span>Version: ${version_name}<br>Server Version: ${server_version}<br>Updated: ${update_count}<br>Commited: ${commit}</span></div>
        <div class="page_info_title">BASED ON</div>
        <div class="page_info"><span><a href="https://html.spec.whatwg.org/" target="_blank">HTML5</a> | <a href="https://developer.mozilla.org/en-US/docs/Web/API" target="_blank">Web API</a> | <a href="https://webkit.org/" target="_blank">WebKit</a> | <a href="https://github.com/Spectrollay/OreUI" target="_blank">OreUI</a></span></div>
        <div class="page_info_title">ABOUT US</div>
        <div class="page_info"><span>Developer: <a href="https://github.com/Spectrollay" target="_blank">@Spectrollay</a><br>Maintainer: <a href="https://github.com/Spectrollay" target="_blank">@Spectrollay</a><br>Program Group: <a href="https://t.me/Spectrollay_MCW" target="_blank">Telegram</a> | <a href="https://qm.qq.com/q/AqLmKLH9mM" target="_blank">QQ</a> | <a href="https://yhfx.jwznb.com/share?key=VyTE7W7sLwRl&ts=1684642802" target="_blank">云湖</a><br>Official Channel: <a href="https://t.me/spectrollay_minecraft_repository" target="_blank">Telegram</a> | <a href="https://pd.qq.com/s/h8a7gt2u4" target="_blank">QQ</a><span></div>
        <div class="page_info_title">MADE WITH ❤️ IN CHINA</div>
        <div class="page_info"><br></div>
    </div>`;
}

// 加载占位图
function replaceLoadingImages() {
    const loadingImage = rootPath + '/images/Loading_white.gif';
    const loadingImageBlack = rootPath + '/images/Loading.gif';
    const loadingImageError = rootPath + '/images/ErrorMessage.png';
    const blackImageClassList = ['header_left_icon', 'header_right_icon', 'title_icon', 'link_img_black'];

    document.querySelectorAll('img').forEach(img => {

        if (img.dataset.processed === 'true') return; // 避免重复处理
        img.dataset.processed = 'true'; // 标记为已处理

        const originalSrc = img.getAttribute('data-src') || img.src;
        const useBlackImage = blackImageClassList.some(className => img.classList.contains(className));
        const placeholderSrc = useBlackImage ? loadingImageBlack : loadingImage;
        const originalStyle = img.getAttribute('style') || '';
        const isUpdateLogo = img.classList.contains('update_logo');
        const isKeyart = img.classList.contains('keyart');
        img.dataset.originalSrc = originalSrc;// 存储原始图片地址

        // 处理图片的加载和DOM更新
        const processImageLoad = (imageElement, srcToLoad, isRetry = false) => {
            imageElement.classList.remove('image_load_error');
            imageElement.removeEventListener('click', handleRetryClick); // 清理当前元素的点击事件
            imageElement.style.cursor = 'unset'; // 恢复默认光标
            const tempImage = new Image(); // 使用独立的Image对象进行预加载

            tempImage.onload = () => {
                // 图片预加载成功,更新元素
                imageElement.src = srcToLoad;
                if (isUpdateLogo || isKeyart) {
                    imageElement.setAttribute('style', originalStyle);
                }
            };

            tempImage.onerror = () => {
                // 图片预加载失败,更新元素,显示错误图片
                imageElement.src = loadingImageError;
                logManager.log("图片加载失败: " + srcToLoad + " ,点击可重新加载.", 'warn');

                // 启用点击重载功能
                imageElement.classList.add('image_load_error');
                imageElement.style.cursor = 'pointer';
                imageElement.addEventListener('click', handleRetryClick); // 添加点击事件监听器
                setTimeout(updateFocusableElements, 10); // 更新元素焦点
            };

            tempImage.src = srcToLoad; // 开始预加载
        };

        // 点击错误图片时触发的重载逻辑
        const handleRetryClick = (event) => {
            event.stopPropagation(); // 阻止事件冒泡到父元素

            const clickedImage = event.currentTarget; // 获取被点击的图片元素
            clickedImage.classList.remove('image_load_error');
            clickedImage.removeEventListener('click', handleRetryClick); // 移除当前的点击监听器
            clickedImage.style.cursor = 'unset'; // 重载时恢复默认光标
            clickedImage.removeAttribute('tabindex');
            clickedImage.src = placeholderSrc; // 显示加载占位图

            setTimeout(() => {
                logManager.log(`重新加载图片: ${clickedImage.dataset.originalSrc}`);
                processImageLoad(clickedImage, clickedImage.dataset.originalSrc, true); // true 表示重载
            }, 10);
        };

        // 设置加载中占位图
        img.src = placeholderSrc;

        if (isUpdateLogo) {
            img.style.width = '100px';
        } else if (isKeyart) {
            img.style.width = '140px';
        }

        // 处理图片加载
        setTimeout(() => {
            processImageLoad(img, originalSrc); // 初始加载
        }, 0);
    });
}

window.addEventListener('load', () => setTimeout(function () {

    replaceLoadingImages(); // 占位图逻辑

    // 更新按钮文本
    const buttons = document.querySelectorAll('.btn, custom-button');

    function updateButtonText(button) {
        const textKey = button.getAttribute('text-generation');
        if (textKey !== null) {
            if (!button.classList.contains('btn')) {
                button.setAttribute('text', texts[textKey]);
                button.querySelector('.btn').innerHTML = texts[textKey];
            } else {
                button.innerHTML = texts[textKey];
            }
        }
    }

    buttons.forEach(button => {
        updateButtonText(button);
    });

    // 禁止拖动元素
    let cantDraggableElements = document.querySelectorAll('img, a');
    cantDraggableElements.forEach(function (cantDraggableElement) {
        cantDraggableElement.draggable = false;
    });

    // 为链接添加点击音效
    let links = document.querySelectorAll('a:not(.sidebar_item)'); // 选择所有类名不为sidebar_item的链接
    links.forEach(link => {
        const originalOnClick = link.getAttribute('onclick');
        if (originalOnClick) { // 如果存在原始的点击事件则先调用原有的再添加
            link.setAttribute('onclick', `playSound('click');${originalOnClick}`);
        } else {
            link.setAttribute('onclick', `playSound('click');`);
        }
    });

}, 10));

const mclang_cn_fix = document.querySelector('#mclang_cn_fix.mclang_cn_fix');
if (mclang_cn_fix) {
    mclang_cn_fix.innerHTML = `
        <div class="block_main wrap_flex">
            <div>
                <div class="title2 download_block_title">和基岩版的无脑翻译说再见!</div>
                <div class="download_block_description" style="text-align: center; width: auto;">适用于所有基于基岩引擎开发的游戏版本!<br>独家适配隐藏内容和不同平台的独有内容!<br>快速适配最新的绝大多数正式版和开发版!</div>
            </div>
            <div>
                <div class="link_block_group_title">访问项目</div>
                <link-block onclick="playSound('click');openLink('https://spectrollay.github.io/mclang_cn/');">
                    <div class="link_title">
                        <img alt="" class="link_title_img" src="${rootPath}/images/logo/mclang_cn_fix.png"/>中文译名修正项目
                    </div>
                </link-block>
            </div>
        </div>
    `;
}

logManager.log("字符常量已成功应用");

// 加载网页时的提示标语
if (tipElement) {
    tipElement.innerHTML = getRandomTip();
    logManager.log("提示标语已选择成功");
} else {
    logManager.log("未发现提示标语框");
}

if (tipElement) {
    tipElement.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            logManager.log("检测到点击了链接,不执行切换提示标语操作");
        } else {
            tipElement.innerHTML = getRandomTip();
            // 禁止拖动元素
            let cantDraggableElements = tipElement.querySelectorAll('img, a');
            cantDraggableElements.forEach(function (cantDraggableElement) {
                cantDraggableElement.draggable = false;
            });

            // 为链接添加点击音效
            let links = tipElement.querySelectorAll('a:not(.sidebar_item)'); // 选择所有类名不为sidebar_item的链接
            links.forEach(link => {
                const originalOnClick = link.getAttribute('onclick');
                if (originalOnClick) { // 如果存在原始的点击事件则先调用原有的再添加
                    link.setAttribute('onclick', `playSound('click');${originalOnClick}`);
                } else {
                    link.setAttribute('onclick', `playSound('click');`);
                }
            });
        }
    });
}

function getRandomTip() {
    // 按权值分组
    const tipsByWeight = {};
    for (const tip of tipsWithWeights) {
        if (!tipsByWeight[tip.weight]) {
            tipsByWeight[tip.weight] = [];
        }
        tipsByWeight[tip.weight].push(tip);
    }
    // logManager.log("按权值分组的提示标语: " + JSON.stringify(tipsByWeight));

    // 计算去重权值总和
    const uniqueWeights = Object.keys(tipsByWeight).map(Number).sort((a, b) => b - a); // 权值降序排列
    const totalWeight = Math.round(uniqueWeights.reduce((acc, weight) => acc + weight, 0) * 1000) / 1000;

    logManager.log("去重总权值: " + totalWeight);

    let randomWeight = Math.random() * totalWeight;
    logManager.log("生成的随机权值: " + randomWeight.toFixed(4));

    let accumulatedWeight = 0;
    let selectedWeight;

    // 确定权值区间
    for (const weight of uniqueWeights) {
        accumulatedWeight += weight;

        if (randomWeight <= accumulatedWeight) {
            selectedWeight = weight;
            logManager.log(`当前权值: ${weight}, 累积权值: ${accumulatedWeight}`);
            logManager.log("选定的权值区间: " + selectedWeight);
            break;
        }
    }

    // 在选定权值区间内随机选择提示标语,并避免与上次选中相同
    const availableTips = tipsByWeight[selectedWeight];
    let chosenTip;
    // logManager.log("在权值 " + selectedWeight + " 区间内可用的提示标语: " + JSON.stringify(availableTips));

    do {
        chosenTip = availableTips[Math.floor(Math.random() * availableTips.length)];
        currentTipIndex = tipsWithWeights.indexOf(chosenTip);
        // logManager.log("尝试选中提示标语: " + chosenTip.text + ", 索引: " + currentTipIndex);
        logManager.log("尝试选中提示标语索引: " + currentTipIndex);
    } while (currentTipIndex === previousTipIndex);

    previousTipIndex = currentTipIndex;
    // logManager.log("最终选中提示标语: " + chosenTip.text + ", 权值: " + selectedWeight);
    logManager.log("最终选中提示标语索引: " + currentTipIndex);

    return chosenTip.text;
}
