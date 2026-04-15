const backToTop = document.getElementById('backToTop');

if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            if (!backToTop.classList.contains('show-back-to-top')) {
                backToTop.classList.add('show-back-to-top');
            }
        } else {
            if (backToTop.classList.contains('show-back-to-top')) {
                backToTop.classList.remove('show-back-to-top');
            }
        }
    }, { passive: true });

    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
