// 星空背景
function createStars(count) {
    const universe = document.querySelector('.universe');
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const xy = Math.random() * 100;
        const duration = Math.random() * 3;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${duration}s`;
        universe.appendChild(star);
    }
}

// 流星效果
function createMeteors(count) {
    const universe = document.querySelector('.universe');
    for (let i = 0; i < count; i++) {
        const meteor = document.createElement('div');
        meteor.className = 'meteor';
        meteor.style.left = `${Math.random() * 100}%`;
        meteor.style.animationDuration = `${Math.random() * 3 + 2}s`;
        universe.appendChild(meteor);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createStars(100); // 创建100个星星
    createMeteors(5); // 创建5个流星
});
