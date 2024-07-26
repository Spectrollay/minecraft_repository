// 自定义按钮
class CustomButton extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render() {
        const data = this.getAttribute('data') || '';
        const [type, status, size, id, isTip, tip, icon] = data.split('|').map(item => item.trim());
        this.status = status || 'normal';
        this.icon = icon || '';
        const ctype = type || 'default';
        const csize = size || 'middle';
        const cid = id || '';
        const cisTip = isTip === true;
        const ctip = tip || '';
        const js = this.getAttribute('js') || 'false';
        const text = this.getAttribute('text') || '';

        if (ctype === "default") {
            if (cisTip === true) {
                this.innerHTML = `
                        <div class="btn_with_tooltip_cont">
                            <button class="btn ${csize}_btn ${status}_btn" id="${cid}">${text}</button>
                            <div class="btn_tooltip">${ctip}</div>
                            <img alt="" class="tip_icon" src="/minecraft_repository/images/${icon}.png"/>
                        </div>
                    `;
            } else {
                this.innerHTML = `
                        <button class="btn ${csize}_btn ${status}_btn" id="${cid}">${text}</button>
                    `;
            }
        } else {
            this.classList.add(ctype + "_custom_btn");
            this.innerHTML = `
                    <button class="btn ${status}_btn ${ctype}_btn" id="${cid}">${text}</button>
                `;
        }

        const button = this.querySelector('button');
        if (button) {
            button.addEventListener('click', () => {
                playSound(button);
            });
            if (this.status !== 'disabled') {
                if (js !== "false") {
                    button.addEventListener('click', () => {
                        eval(js);
                    });
                }
            }
        }
    }
}

customElements.define('custom-button', CustomButton);


// 自定义Checkbox复选框
class CustomCheckbox extends HTMLElement {
    constructor() {
        super();
        this.render();

        // 点击元素本身执行点击事件
        // this.addEventListener('click', this.toggleCheckbox.bind(this));
        // 点击父元素执行点击事件
        const parentElement = this.parentElement;
        if (parentElement) {
            parentElement.addEventListener('click', this.toggleCheckbox.bind(this));
        }
    }

    render() {
        const active = this.getAttribute('active') || 'off';
        const status = this.getAttribute('status') || 'disabled';

        const isDisabled = status !== 'enabled';
        const isOn = active === 'on';

        this.innerHTML = `
            <div class="custom-checkbox ${isOn ? 'on' : 'off'} ${isDisabled ? 'disabled' : 'enabled'}">
                <img alt="" class="checkmark" src="/minecraft_repository/images/check_white.png"/>
            </div>
        `;
    }

    toggleCheckbox() {
        if (this.getAttribute('status') !== 'enabled') {
            return;
        }

        const isChecked = this.getAttribute('active') === 'on';
        playSound1();
        if (isChecked) {
            this.setAttribute('active', 'off');
            console.log("关闭复选框", this.id);
            if (this.classList.contains('neverShowIn15Days')) {
                localStorage.removeItem('(/minecraft_repository/)neverShowIn15Days');
            }
        } else {
            this.setAttribute('active', 'on');
            console.log("打开复选框", this.id);
            if (this.classList.contains('neverShowIn15Days')) {
                localStorage.setItem('(/minecraft_repository/)neverShowIn15Days', Date.now().toString());
            }
        }

        this.render();
    }
}

customElements.define('custom-checkbox', CustomCheckbox);


// Modal弹窗
setTimeout(function () {
    const modals = document.querySelectorAll('modal');
    if (modals) {
        modals.forEach((modal) => {
            const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
            let focusableElements = modal.querySelectorAll(focusableElementsString);
            focusableElements = Array.prototype.slice.call(focusableElements);

            const firstTabStop = focusableElements[0];
            const lastTabStop = focusableElements[focusableElements.length - 1];

            modal.addEventListener('keydown', function (e) {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstTabStop) {
                            e.preventDefault();
                            lastTabStop.focus();
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastTabStop) {
                            e.preventDefault();
                            firstTabStop.focus();
                        }
                    }
                }
            });
            // 聚焦模态框内的第一个可聚焦元素
            modal.addEventListener('shown.modal', function () {
                firstTabStop.focus();
            });
        });
    }
}, 100);

const modalCloseBtns = document.querySelectorAll('modal_close_btn');
if (modalCloseBtns) {
    modalCloseBtns.forEach((modalCloseBtn) => {
        modalCloseBtn.setAttribute('tabindex', '0');
        modalCloseBtn.addEventListener('keyup', function (event) {
            if (event.key === 'Enter') {
                modalCloseBtn.click();
            }
        });
    });
}

function showModal(modal) {
    const overlay = document.getElementById("overlay_" + modal);
    const frame = document.getElementById(modal);
    overlay.style.display = "block";
    frame.style.display = "block";
}

function hideModal(button) {
    let frameId;
    let currentElement = button.parentElement;

    while (currentElement) {
        if (currentElement.tagName.toLowerCase() === 'modal_area') {
            frameId = currentElement.id;
            break;
        }
        currentElement = currentElement.parentElement;
    }

    const overlay = document.getElementById("overlay_" + frameId);
    const frame = document.getElementById(frameId);
    playSound(button);
    overlay.style.display = "none";
    frame.style.display = "none";
}


// 自定义Slider滑块
class CustomSlider extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="slider_area">
                <div>Selected: <span class="slider_tooltip">0.00</span></div>
                <div class="slider_content">
                    <div class="slider">
                        <div class="slider_process"></div>
                        <div class="slider_slider"></div>
                        <div class="slider_segment" style="display: none"></div>
                    </div>
                </div>
            </div>
        `;
        this.render();
    }

    render() {
        const content = this.querySelector('.slider_content');
        const tooltip = this.querySelector('.slider_tooltip');
        const slider = this.querySelector('.slider');
        const process = this.querySelector('.slider_process');
        const handle = this.querySelector('.slider_slider');
        const sliderData = JSON.parse(this.getAttribute('data-slider'));
        const minValue = sliderData.minValue;
        const maxValue = sliderData.maxValue;
        const segments = sliderData.segments;
        const initialValue = sliderData.initialValue || minValue;
        const showSegments = this.getAttribute('data-show-segments');
        const customSegments = this.getAttribute('data-custom-segments') === "true";
        const segmentValues = customSegments ? JSON.parse(this.getAttribute('data-segment-values')) : [];
        const isDisabled = this.id.includes('disabled');
        const type = this.getAttribute('type');

        let currentValue = initialValue;
        let isDragging = false;

        function formatValue(value) {
            return Number.isInteger(value) ? value : value.toFixed(2);
        }

        function updateHandle(position) {
            handle.style.left = position + '%';
            process.style.width = position + '%';
        }

        function updateTooltip(position) {
            if (type === 'set') {
                const segmentIndex = Math.round(position / (100 / segments));
                const segmentValue = customSegments ? segmentValues[segmentIndex] : minValue + segmentIndex * (maxValue - minValue) / segments;
                tooltip.textContent = customSegments ? segmentValue : formatValue(segmentValue);
            } else {
                tooltip.textContent = formatValue(calculateValue(position));
            }
        }

        function calculatePosition(value) {
            return (value - minValue) / (maxValue - minValue) * 100;
        }

        function calculateValue(position) {
            return position * (maxValue - minValue) / 100 + minValue;
        }

        function setSliderValue(position) {
            currentValue = position * (maxValue - minValue) / 100 + minValue;
            updateHandle(position);
            updateTooltip(position);
        }

        function snapToSegment(position) {
            const segmentIndex = Math.round(position / (100 / segments));
            const segmentPosition = segmentIndex * (100 / segments);
            currentValue = customSegments ? segmentValues[segmentIndex] : minValue + segmentIndex * (maxValue - minValue) / segments;
            updateHandle(segmentPosition);
            updateTooltip(segmentPosition);
        }

        // 设置初始值并展示
        updateHandle(calculatePosition(initialValue));
        updateTooltip(calculatePosition(initialValue));

        if (type === 'range') {
            // 添加最小值和最大值提示
            if (showSegments === null || showSegments === "true") {
                const minValueLabel = document.createElement('div');
                minValueLabel.classList.add('slider_value_info');
                minValueLabel.textContent = formatValue(minValue);
                minValueLabel.style.position = 'absolute';
                minValueLabel.style.bottom = '-35px';
                slider.appendChild(minValueLabel);

                const minValueLabelWidth = minValueLabel.offsetWidth;
                minValueLabel.style.left = `calc(0% - ${minValueLabelWidth / 2}px)`;

                const maxValueLabel = document.createElement('div');
                maxValueLabel.classList.add('slider_value_info');
                maxValueLabel.textContent = formatValue(maxValue);
                maxValueLabel.style.position = 'absolute';
                maxValueLabel.style.bottom = '-35px';
                slider.appendChild(maxValueLabel);

                const maxValueLabelWidth = maxValueLabel.offsetWidth;
                maxValueLabel.style.left = `calc(100% - ${maxValueLabelWidth / 2}px)`;
            }
        } else if (type === 'set') {
            // 创建分段线和标签
            for (let i = 0; i <= segments; i++) {
                if (i > 0 && i < segments) {
                    const segment = document.createElement('div');
                    segment.classList.add('slider_segment');
                    segment.style.left = `calc(${(i / segments) * 100}% - 1px)`;
                    slider.appendChild(segment);
                }

                if (showSegments === "true") {
                    const segmentValueLabel = document.createElement('div');
                    const segmentValue = customSegments ? segmentValues[i] : minValue + i * (maxValue - minValue) / segments;
                    segmentValueLabel.classList.add('slider_value_info');
                    segmentValueLabel.textContent = customSegments ? segmentValue : formatValue(segmentValue);
                    segmentValueLabel.style.position = 'absolute';
                    segmentValueLabel.style.bottom = '-35px';
                    slider.appendChild(segmentValueLabel);

                    const segmentValueLabelWidth = segmentValueLabel.offsetWidth;
                    segmentValueLabel.style.left = `calc(${(i / segments) * 100}% - ${segmentValueLabelWidth / 2}px)`;
                }
            }
        }

        if (isDisabled) {
            handle.classList.add('disabled_slider');
            slider.classList.add('disabled_slider');
            return;
        }

        const startDrag = (event) => {
            process.style.transition = 'none';
            handle.style.transition = 'none';
            isDragging = true;
            updatePosition(event);
        };

        const stopDrag = (event) => {
            if (isDragging) {
                const position = currentPosition(event);
                if (type === 'set') {
                    snapToSegment(position);
                } else {
                    setSliderValue(position);
                }
            }
            isDragging = false;
            process.style.transition = 'width 100ms linear';
            handle.style.transition = 'left 100ms linear';
        };

        const updatePosition = (event) => {
            if (!isDragging) return;
            event.preventDefault();
            const position = currentPosition(event);
            setSliderValue(position);
        };

        const currentPosition = (event) => {
            const rect = slider.getBoundingClientRect();
            let position;

            if (event.touches && event.touches.length > 0) {
                position = (event.touches[0].clientX - rect.left) / rect.width * 100;
            } else if (event.changedTouches && event.changedTouches.length > 0) {
                position = (event.changedTouches[0].clientX - rect.left) / rect.width * 100;
            } else if (event.clientX !== undefined) {
                position = (event.clientX - rect.left) / rect.width * 100;
            } else {
                position = 0;  // Fallback position
            }

            return Math.max(0, Math.min(position, 100));
        };

        handle.addEventListener('mousedown', startDrag);
        handle.addEventListener('touchstart', startDrag);
        window.addEventListener('mousemove', updatePosition);
        window.addEventListener('touchmove', updatePosition);
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('touchend', stopDrag);

        // 点击slider区域移动
        content.addEventListener('click', (event) => {
            const position = currentPosition(event);
            if (type === 'set') {
                snapToSegment(position);
            } else {
                setSliderValue(position);
            }
        });
    }
}

customElements.define('custom-slider', CustomSlider);


// 自定义Switch开关
class CustomSwitch extends HTMLElement {
    constructor() {
        super();
        this.render();
    }

    render() {
        const active = this.getAttribute('active') || 'off';
        const status = this.getAttribute('status') || 'disabled_switch';

        const isDisabled = status !== 'enabled';
        const isOn = active === 'on';

        this.innerHTML = `
            <div class="switch_content">
                <div class="switch ${isOn ? 'on' : 'off'} ${isDisabled ? 'disabled_switch' : 'normal_switch'}">
                    <div class="switch_style left"><img alt="" src="/minecraft_repository/images/switch_on.png"/></div>
                    <div class="switch_style right"><img alt="" src="/minecraft_repository/images/switch_off.png"/></div>
                    <div class="switch_slider can_click"></div>
                </div>
            </div>
        `;

        // 添加点击事件监听器
        const switchElement = this.querySelector(".switch");
        const switchSlider = this.querySelector(".switch_slider");
        let isSwitchOn = switchElement.classList.contains("on");
        let isSwitchDisabled = switchElement.classList.contains("disabled_switch");
        let startX = 0;
        let isDragging = false;

        if (!isSwitchDisabled) {

            // 点击父元素执行点击事件
            const parentElement = this.parentElement;
            if (parentElement) {
                parentElement.addEventListener("click", () => {
                    if (!isDragging) {
                        isSwitchOn = !isSwitchOn;
                        this.updateSwitchState(isSwitchOn);
                    }
                });
            }

            // 点击元素本身执行点击事件
            switchElement.addEventListener("click", () => {
                isSwitchOn = !isSwitchOn;
                this.updateSwitchState(isSwitchOn);
            });

            // 拖动事件
            switchElement.addEventListener("mousedown", (e) => {
                isDragging = true;
                switchSlider.classList.add('active');
                startX = e.clientX;
            });

            switchElement.addEventListener("touchstart", (e) => {
                isDragging = true;
                switchSlider.classList.add('active');
                startX = e.touches[0].clientX;
            });

            document.addEventListener("mouseup", (e) => {
                if (isDragging) {
                    let elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
                    if (!switchElement.contains(elementAtPoint)) {
                        let currentX = e.clientX;
                        if (currentX - startX > 10) {
                            if (!isSwitchOn) {
                                isSwitchOn = true;
                                this.updateSwitchState(isSwitchOn);
                            }
                        } else if (currentX - startX < -10) {
                            if (isSwitchOn) {
                                isSwitchOn = false;
                                this.updateSwitchState(isSwitchOn);
                            }
                        }
                    }
                }
                setTimeout(() => {
                    isDragging = false;
                    switchSlider.classList.remove('active');
                }, 0);
            });

            document.addEventListener("touchend", (e) => {
                if (isDragging) {
                    let currentX = e.changedTouches[0].clientX;
                    if (currentX - startX > 10) {
                        if (!isSwitchOn) {
                            isSwitchOn = true;
                            this.updateSwitchState(isSwitchOn);
                        }
                    } else if (currentX - startX < -10) {
                        if (isSwitchOn) {
                            isSwitchOn = false;
                            this.updateSwitchState(isSwitchOn);
                        }
                    }
                }
                setTimeout(() => {
                    isDragging = false;
                    switchSlider.classList.remove('active');
                }, 0);
            });
        }
    }

    updateSwitchState(isOn) {
        playSound1();
        const switchElement = this.querySelector(".switch");
        const switchSlider = this.querySelector(".switch_slider");
        console.log(isOn ? "打开开关" : "关闭开关", this.id);
        switchElement.classList.toggle("on", isOn);
        switchElement.classList.toggle("off", !isOn);
        if (isOn) {
            switchSlider.classList.add('switch_bounce_left');
            switchSlider.classList.remove('switch_bounce_right');
        } else {
            switchSlider.classList.add('switch_bounce_right');
            switchSlider.classList.remove('switch_bounce_left');
        }
        const switchStatus = this.querySelector(".switch_status");
        if (switchStatus) {
            switchStatus.textContent = `Toggle: ${isOn ? 'Open' : 'Close'}`;
        }
    }

}

customElements.define('custom-switch', CustomSwitch);


