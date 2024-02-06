function selectTab(tabNumber) {
    document.querySelectorAll('.tab_bar_btn').forEach(button => {
        button.classList.remove('active');
        button.classList.add('no_active');
    });

    let tab_btn = document.getElementById(`tab${tabNumber}`);
    tab_btn.classList.add('active')
    tab_btn.classList.remove('no_active');
}