function selectTab(tabNumber) {
    document.querySelectorAll('.tab_bar_btn').forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(`tab${tabNumber}`).classList.add('active');
}