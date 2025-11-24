// 图片修复脚本 - 强制确保所有图片正确加载
console.log('图片修复脚本启动 - 强制模式');

// 直接修复图片的函数
function fixImages() {
  console.log('执行强制图片修复...');
  
  // 1. 修复实验室照片
  const labPhotos = [
    { selector: '[data-image="index.photos.photos[0].src"]', path: 'photos/实验室1.jpg' },
    { selector: '[data-image="index.photos.photos[1].src"]', path: 'photos/实验室2.jpg' },
    { selector: '[data-image="index.photos.photos[2].src"]', path: 'photos/实验室3.jpg' }
  ];
  
  labPhotos.forEach((photo, index) => {
    const element = document.querySelector(photo.selector);
    if (element) {
      console.log(`修复实验室照片${index}:`, photo.path);
      // 直接设置src，不依赖config
      element.src = photo.path;
      element.dataset.fixed = 'true';
      
      // 添加加载状态处理
      element.onload = function() {
        console.log(`实验室照片${index}加载成功`);
        this.style.display = 'block'; // 确保图片可见
      };
      
      element.onerror = function() {
        console.error(`实验室照片${index}加载失败，文件可能不存在`);
        this.style.display = 'block'; // 即使失败也确保图片元素可见
        this.alt = `实验室照片${index}（加载失败）`;
      };
    } else {
      console.warn(`未找到实验室照片元素${index}:`, photo.selector);
      // 尝试更通用的选择器
      const altElement = document.querySelector(`[data-image^="index.photos.photos"][data-image*="[${index}]"]`);
      if (altElement) {
        console.log(`使用替代选择器找到实验室照片${index}`);
        altElement.src = photo.path;
        altElement.dataset.fixed = 'true';
      }
    }
  });
  
  // 2. 修复logo图片
  const logoElement = document.querySelector('[data-image="logo"]');
  if (logoElement) {
    console.log('修复logo图片');
    logoElement.src = 'photos/学术网站开发与内容设计.png';
    logoElement.dataset.fixed = 'true';
  }
  
  // 3. 修复首页主图
  const heroImage = document.querySelector('[data-image="index.hero.image"]');
  if (heroImage) {
    console.log('修复首页主图');
    heroImage.src = 'photos/首页.jpg';
    heroImage.dataset.fixed = 'true';
  }
  
  // 4. 额外的兜底措施 - 查找所有图片元素并检查
  const allImages = document.querySelectorAll('img[data-image]');
  console.log(`找到${allImages.length}个带有data-image属性的图片元素`);
  
  allImages.forEach((img, index) => {
    // 如果图片没有被修复过，且当前没有src或者src为空，尝试设置默认路径
    if (!img.dataset.fixed && (!img.src || img.src.includes('about:blank') || img.src.includes('data:image/'))) {
      const dataImage = img.getAttribute('data-image');
      console.log(`检测到可能未加载的图片${index}:`, dataImage);
      
      // 根据data-image属性尝试设置合理的默认路径
      if (dataImage.includes('index.photos')) {
        // 对于实验室照片，使用第一张作为默认
        img.src = 'photos/实验室1.jpg';
        console.log(`为未加载的图片设置默认路径`);
        img.dataset.fixed = 'true';
      }
    }
  });
}

// 立即执行一次修复
fixImages();

// 当DOM加载完成后再次执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，再次执行图片修复');
    fixImages();
  });
} else {
  // DOM已加载，立即再次执行
  setTimeout(() => {
    console.log('DOM已加载，再次执行图片修复');
    fixImages();
  }, 500);
}

// 延迟3秒后再次执行，确保所有内容都已加载
setTimeout(() => {
  console.log('延迟修复 - 确保所有图片加载');
  fixImages();
}, 3000);

// 延迟5秒后进行最终检查
setTimeout(() => {
  console.log('最终检查所有图片状态');
  const images = document.querySelectorAll('img[data-image]');
  images.forEach((img, index) => {
    console.log(`图片${index}状态:`, {
      src: img.src,
      fixed: img.dataset.fixed,
      complete: img.complete,
      naturalWidth: img.naturalWidth
    });
    
    // 如果图片看起来没有正确加载，强制显示
    if (!img.complete || img.naturalWidth === 0) {
      console.log(`强制显示图片${index}`);
      img.style.display = 'block';
      img.style.minHeight = '100px';
      img.style.background = '#f0f0f0';
    }
  });
}, 5000);

// 暴露函数到window，便于调试和手动触发
window.fixImages = fixImages;