// 性能优化脚本

// 图片预加载功能
function preloadImages(imageUrls) {
    const images = [];
    for (let i = 0; i < imageUrls.length; i++) {
        images[i] = new Image();
        images[i].src = imageUrls[i];
    }
}

// 延迟加载非关键资源
function lazyLoadNonCriticalResources() {
    // 延迟加载图片
    const lazyImages = document.querySelectorAll('img[data-src]');
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                lazyImageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => lazyImageObserver.observe(img));
    
    // 延迟加载视频
    const lazyVideos = document.querySelectorAll('video source[data-src]');
    const lazyVideoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const source = entry.target;
                const video = source.parentElement;
                source.src = source.dataset.src;
                video.load();
                lazyVideoObserver.unobserve(source);
            }
        });
    });
    
    lazyVideos.forEach(source => lazyVideoObserver.observe(source));
}

// 优化字体加载
function optimizeFontLoading() {
    // 预连接到字体服务
    const fontDomains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com'
    ];
    
    fontDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = `https://${domain}`;
        document.head.appendChild(link);
    });
}

// 资源预加载
function preloadCriticalResources() {
    // 预加载关键CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'preload';
    cssLink.href = 'style.css';
    cssLink.as = 'style';
    document.head.appendChild(cssLink);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 优化滚动事件处理
function optimizeScrollHandling() {
    // 使用节流优化滚动事件
    const throttledScroll = throttle(() => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('py-2', 'shadow-md', 'bg-white/95', 'transition-all', 'duration-300');
            navbar.classList.remove('py-3', 'shadow-sm', 'bg-transparent');
        } else {
            navbar.classList.add('py-3', 'shadow-sm', 'bg-transparent', 'transition-all', 'duration-300');
            navbar.classList.remove('py-2', 'shadow-md', 'bg-white/95');
        }
    }, 100);
    
    window.addEventListener('scroll', throttledScroll);
    
    // 移除页面内跳转逻辑，允许正常的页面跳转
}

// 优化动画性能
function optimizeAnimations() {
    // 使用CSS transitions而非JavaScript动画
    // 确保使用transform和opacity属性进行动画
    
    // 减少动画帧数
    const elements = document.querySelectorAll('.animate-on-scroll');
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                animationObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => animationObserver.observe(el));
}

// 缓存DOM查询结果
function cacheDomElements() {
    // 缓存常用的DOM元素
    window.appCache = {
        navbar: document.getElementById('navbar'),
        mobileMenu: document.getElementById('mobile-menu'),
        menuToggle: document.getElementById('menu-toggle'),
        sections: document.querySelectorAll('section'),
        navLinks: document.querySelectorAll('.nav-links a'),
        filterButtons: document.querySelectorAll('.student-filter-btn'),
        studentCards: document.querySelectorAll('.student-card'),
        projectFilterButtons: document.querySelectorAll('.project-filter-btn'),
        projectCards: document.querySelectorAll('.project-card'),
        contactForm: document.getElementById('contact-form')
    };
}

// 启用Service Worker进行缓存
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
        });
    }
}

// 性能监控
function monitorPerformance() {
    if ('performance' in window && 'measure' in performance) {
        // 监控关键渲染路径
        performance.mark('navigation-start');
        
        window.addEventListener('load', () => {
            performance.mark('load');
            performance.measure('navigation-to-load', 'navigation-start', 'load');
            
            // 记录首次内容绘制
            if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        console.log(`Performance metric: ${entry.name} = ${entry.startTime}ms`);
                    });
                });
                
                observer.observe({ entryTypes: ['paint', 'layout-shift', 'resource'] });
            }
        });
    }
}

// 页面预热
function warmupPage() {
    // 预渲染常见用户路径
    const prefetchLinks = document.querySelectorAll('a.prefetch');
    prefetchLinks.forEach(link => {
        const prefetch = document.createElement('link');
        prefetch.rel = 'prefetch';
        prefetch.href = link.href;
        document.head.appendChild(prefetch);
    });
}

// 合并多个DOM操作
function batchDomOperations(operations) {
    // 使用requestAnimationFrame优化DOM操作
    requestAnimationFrame(() => {
        operations.forEach(operation => operation());
    });
}

// 主优化函数
function optimizePagePerformance() {
    // 缓存DOM元素
    cacheDomElements();
    
    // 资源预加载
    preloadCriticalResources();
    
    // 延迟加载非关键资源
    lazyLoadNonCriticalResources();
    
    // 优化字体加载
    optimizeFontLoading();
    
    // 优化滚动处理
    optimizeScrollHandling();
    
    // 优化动画
    optimizeAnimations();
    
    // 性能监控
    monitorPerformance();
    
    // 页面预热
    warmupPage();
    
    // 注册Service Worker
    registerServiceWorker(); // 已创建sw.js文件，启用缓存功能
    
    console.log('页面性能优化完成');
}

// 页面加载完成后执行优化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizePagePerformance);
} else {
    // 立即执行，如果DOM已加载
    optimizePagePerformance();
}