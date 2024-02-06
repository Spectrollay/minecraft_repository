function selectTab(tabNumber) {
    document.querySelectorAll('.tab_bar_btn').forEach(button => {
        button.classList.remove('active');
        button.classList.add('no_active');
    });

    document.getElementById(`tab${tabNumber}`).classList.add('active');
    document.getElementById(`tab${tabNumber}`).classList.remove('no_active');
}