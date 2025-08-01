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

const maintenanceModal = `
    <div class="overlay" id="overlay_maintenance_notice" style="z-index: 51;"></div>
    <modal_area id="maintenance_notice" style="z-index: 52;">
        <modal>
            <modal_title_area>
                <modal_title>数据库调整维护通知</modal_title>
                <modal_close_btn class="close_btn" onclick="hideModal(this);">
                    <img alt="" class="modal_close_btn_img" src="${rootPath}/images/cross_white.png"/>
                </modal_close_btn>
            </modal_title_area>
            <modal_content>
                <p>我们正在对版本库的数据库进行更新维护, 版本库的部分资源将无法下载. 如果你想要下载的资源无法获取, 你可以加入我们的 <a href="https://t.me/spectrollay_minecraft_repository" target="_blank">Telegram</a> | <a href="https://pd.qq.com/s/h8a7gt2u4" target="_blank">QQ</a> 官方频道或 <a href="https://t.me/Spectrollay_MCW" target="_blank">Telegram</a> | <a href="https://qm.qq.com/q/AqLmKLH9mM" target="_blank">QQ</a> | <a href="https://yhfx.jwznb.com/share?key=VyTE7W7sLwRl&ts=1684642802" target="_blank">云湖</a> 聊天群组获取, 这里会发布需求量较大的临时资源链接. 如果频道或群组中还是没有你想要的资源, 可以向管理员询问该资源的临时下载方式. 感谢你的理解与配合, 也祝你新年快乐!</p>
            </modal_content>
            <modal_button_area>
                <modal_button_group>
                    <modal_button_list>
                        <custom-button data="modal|red|||false||" js="localStorage.setItem('(/minecraft_repository/)never_show_maintenance_modal_again_20250128', 'true');hideModal(this);" text="不再显示"></custom-button>
                        <custom-button data="modal|green|||false||" js="hideModal(this);" text="我知道了"></custom-button>
                    </modal_button_list>
                </modal_button_group>
            </modal_button_area>
        </modal>
    </modal_area>`;

document.body.insertAdjacentHTML('afterbegin', maintenanceModal);

window.addEventListener('load', () => setTimeout(function () {
    if (localStorage.getItem('(/minecraft_repository/)never_show_maintenance_modal_again_20250128') !== 'true') { // TODO 维护公告,在完成维护后移除
        const overlay = document.getElementById('overlay_maintenance_notice');
        const modal = document.getElementById('maintenance_notice');
        overlay.style.display = 'block';
        modal.style.display = 'block';
        modal.focus();
        logManager.log("显示数据库维护弹窗");
    }
}, 20)); // 页面加载完成后延时显示弹窗
