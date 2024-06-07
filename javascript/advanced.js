// 实验性

// Slider滑块函数
const sliderContent = document.getElementsByClassName("slider_content");

for (let i = 0; i < sliderContent.length; i++) {

    const contentId = sliderContent[i].id;
    const content = document.getElementById(contentId);
    const slider = content.querySelector('.slider');
    let isDisabled = slider.classList.contains("disabled_slider");
    const process = content.querySelector('.slider_process');
    const handle = content.querySelector('.slider_handle');
    const tooltip = content.querySelector('.slider_tooltip');
    const sliderData = JSON.parse(slider.dataset.slider);
    const minValue = sliderData.minValue;
    const maxValue = sliderData.maxValue;
    const segments = sliderData.segments;
    const initialValue = sliderData.initialValue || minValue; // 使用初始值或最小值作为默认值

    let currentValue = initialValue;
    let resizing = false;

    // 设置初始值并展示
    const initialPosition = (initialValue - minValue) / (maxValue - minValue) * 100;
    handle.style.left = initialPosition + '%';
    process.style.width = initialPosition + '%';

    if (slider.classList.contains('range_slider')) {

        // 添加最小值和最大值提示
        const minValueLabel = document.createElement('div');
        minValueLabel.textContent = minValue.toFixed(2);
        minValueLabel.style.position = 'absolute';
        minValueLabel.style.bottom = '-35px';
        slider.appendChild(minValueLabel);

        const minValueLabelWidth = minValueLabel.offsetWidth;
        minValueLabel.style.left = `calc(0% - ${minValueLabelWidth / 2}px)`;

        const maxValueLabel = document.createElement('div');
        maxValueLabel.textContent = maxValue.toFixed(2);
        maxValueLabel.style.position = 'absolute';
        maxValueLabel.style.bottom = '-35px';
        slider.appendChild(maxValueLabel);

        const maxValueLabelWidth = maxValueLabel.offsetWidth;
        maxValueLabel.style.left = `calc(100% - ${maxValueLabelWidth / 2}px)`;

    } else if (slider.classList.contains('set_slider')) {

        // 创建分段线
        if (segments) {
            for (let i = 1; i < segments; i++) {
                const segment = document.createElement('div');
                segment.classList.add('slider_segment');
                segment.style.left = `calc(${100 / segments * i}% - 1px)`;
                slider.appendChild(segment);
            }
        }

        // 添加分段处提示数值
        if (segments) {
            for (let i = 0; i < segments + 1; i++) {
                const segmentValueLabel = document.createElement('div');
                const segmentValue = minValue + i * (maxValue - minValue) / segments;
                segmentValueLabel.textContent = segmentValue.toFixed(2).replace(/\.?0+$/, '');
                segmentValueLabel.style.position = 'absolute';
                segmentValueLabel.style.bottom = '-35px';
                slider.appendChild(segmentValueLabel);

                // 获取标签宽度
                const labelWidth = segmentValueLabel.offsetWidth;
                segmentValueLabel.style.left = `calc(${(i / segments) * 100}% - ${labelWidth / 2}px)`;
            }
        }

    }

    if (!isDisabled) {
        if (slider.classList.contains('range_slider')) {
            // 设置平滑的slider

            let isDragging = false;
            tooltip.textContent = initialValue.toFixed(2);

            function updateValueSmoothSlider(posX) {
                const smoothIndex = ((posX) / (slider.offsetWidth - 4));
                currentValue = smoothIndex * (maxValue - minValue) + minValue;
                tooltip.textContent = currentValue.toFixed(2);
            }

            function updateSmoothSlider(e) {
                updateProcessBar(updateSlider(e));
                updateValueSmoothSlider(updateSlider(e));
            }

            function handleDragSmoothSlider(e) {
                if (isDragging) {
                    updateSmoothSlider(e);
                }
            }

            handle.addEventListener('mousedown', function () {
                process.style.transition = 'none';
                handle.style.transition = 'none';
                isDragging = true;
            });

            document.addEventListener('mousemove', handleDragSmoothSlider);

            document.addEventListener('mouseup', function () {
                isDragging = false;
                process.style.transition = 'width 100ms linear';
                handle.style.transition = 'left 100ms linear';
                handle.classList.remove('active');
            });

            handle.addEventListener('touchstart', function () {
                process.style.transition = 'none';
                handle.style.transition = 'none';
                isDragging = true;
            });

            document.addEventListener('touchmove', function (e) {
                if (isDragging) {
                    handleDragSmoothSlider(e.touches[0]); // 使用第一个触摸点的位置
                    e.preventDefault();
                }
            }, {passive: false});

            document.addEventListener('touchend', function () {
                isDragging = false;
                process.style.transition = 'width 100ms linear';
                handle.style.transition = 'left 100ms linear';
                handle.classList.remove('active');
            });

            slider.addEventListener('touchstart', function () {
            });

            content.addEventListener('click', function (e) {
                let posX = e.clientX - slider.getBoundingClientRect().left;
                if (posX < 0) {
                    posX = 0;
                } else if (posX > (slider.offsetWidth - 4)) {
                    posX = (slider.offsetWidth - 4);
                }
                handle.style.left = posX + 'px';
                updateProcessBar(posX);
                updateValueSmoothSlider(posX);
            });

        } else if (slider.classList.contains('set_slider')) {
            // 设置分段的slider

            const segmentWidth = (maxValue - minValue) / segments;
            let isDragging = false;
            tooltip.textContent = initialValue.toFixed(2).replace(/\.?0+$/, '');

            function updateValueSegmentSlider(posX) {
                const segmentIndex = Math.round(posX / ((slider.offsetWidth - 4) / segments));
                currentValue = segmentIndex * segmentWidth + minValue;
                tooltip.textContent = currentValue.toFixed(2).replace(/\.?0+$/, '');
                updateProcessBar(posX);
            }

            function updateSegmentSlider(e) {
                let posX = e.clientX - slider.getBoundingClientRect().left;
                updateSlider(e);
                updateProcessBar(posX);
            }

            function handleDragSegmentSlider(e) {
                if (isDragging) {
                    updateSegmentSlider(e);
                }
            }

            function moveEnd() {
                isDragging = false;
                const segmentIndex = Math.round(handle.offsetLeft / ((slider.offsetWidth - 4) / segments));
                const segmentPosition = segmentIndex * ((slider.offsetWidth - 4) / segments);
                handle.style.left = segmentPosition + 'px';
                handle.classList.remove('active');
                updateValueSegmentSlider(segmentPosition);
            }

            handle.addEventListener('mousedown', function () {
                isDragging = true;
            });

            document.addEventListener('mousemove', handleDragSegmentSlider);

            document.addEventListener('mouseup', function () {
                moveEnd();
            });

            handle.addEventListener('touchstart', function () {
                isDragging = true;
            });

            document.addEventListener('touchmove', function (e) {
                if (isDragging) {
                    handleDragSegmentSlider(e.touches[0]); // 使用第一个触摸点的位置
                    e.preventDefault();
                }
            }, {passive: false});

            document.addEventListener('touchend', function () {
                moveEnd();
            });

            slider.addEventListener('touchstart', function () {
            });

            content.addEventListener('click', function (e) {
                let posX = e.clientX - slider.getBoundingClientRect().left;
                if (posX < 0) {
                    posX = 0;
                } else if (posX > (slider.offsetWidth - 4)) {
                    posX = (slider.offsetWidth - 4);
                }
                const segmentIndex = Math.round(posX / ((slider.offsetWidth - 4) / segments));
                const segmentPosition = segmentIndex * ((slider.offsetWidth - 4) / segments);
                handle.style.left = segmentPosition + 'px';
                updateValueSegmentSlider(segmentPosition);
            });
        }
    }

    function updateSlider(e) {
        let posX = e.clientX - slider.getBoundingClientRect().left;
        handle.classList.add('active');
        if (posX < 0) {
            posX = 0;
        } else if (posX > (slider.offsetWidth - 4)) {
            posX = (slider.offsetWidth - 4);
        }
        handle.style.left = posX + 'px';
        return posX;
    }

    function updateHandle() {
        const rect = slider.getBoundingClientRect();
        const newPosition = (currentValue - minValue) / (maxValue - minValue) * (rect.width - 4);
        handle.style.left = newPosition + 'px';
    }

    function updateProcessBar(posX) {
        process.style.width = posX + 'px';
    }

    window.addEventListener('resize', function () {
        if (!resizing) {
            resizing = true;
            setTimeout(function () {
                resizing = false;
            }, 0);
            process.style.transition = 'none';
            handle.style.transition = 'none';
            updateHandle();
            updateProcessBar(handle.offsetLeft);
            setTimeout(function () {
                process.style.transition = 'width 100ms linear';
                handle.style.transition = 'left 100ms linear';
            }, 0);
        }
    });
}
