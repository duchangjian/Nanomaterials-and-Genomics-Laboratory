// 便捷内容替换工具

class ContentEditor {
    constructor() {
        this.editableElements = [];
        this.isEnabled = false;
        this.initialize();
    }

    initialize() {
        // 添加编辑按钮到页面
        this.addEditButton();
        
        // 监听编辑模式切换
        document.addEventListener('click', (e) => {
            if (e.target.id === 'toggle-edit-mode') {
                this.toggleEditMode();
            }
        });
        
        // 监听内容修改
        document.addEventListener('click', (e) => {
            if (this.isEnabled && e.target.classList.contains('editable-content')) {
                this.startEditing(e.target);
            }
        });
        
        // 监听ESC键取消编辑
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentEditingElement) {
                this.cancelEditing();
            }
        });
    }

    addEditButton() {
        const editButton = document.createElement('div');
        editButton.id = 'toggle-edit-mode';
        editButton.className = 'fixed bottom-6 right-6 bg-primary text-white p-3 rounded-full shadow-lg cursor-pointer z-50 transition-all hover:bg-primary/90';
        editButton.innerHTML = '<i class="fa fa-edit"></i>';
        editButton.title = '切换编辑模式';
        document.body.appendChild(editButton);
    }

    toggleEditMode() {
        this.isEnabled = !this.isEnabled;
        const editButton = document.getElementById('toggle-edit-mode');
        
        if (this.isEnabled) {
            editButton.classList.add('bg-red-500');
            editButton.classList.remove('bg-primary');
            editButton.innerHTML = '<i class="fa fa-times"></i>';
            this.enableEditing();
            // 显示更友好的通知而不是alert
            this.showNotification('编辑模式已启用！点击任何高亮的内容块进行修改。按ESC键取消编辑。', 'info');
        } else {
            editButton.classList.add('bg-primary');
            editButton.classList.remove('bg-red-500');
            editButton.innerHTML = '<i class="fa fa-edit"></i>';
            this.disableEditing();
            // 显示更友好的通知而不是alert
            this.showNotification('编辑模式已禁用！', 'info');
        }
    }

    enableEditing() {
        // 获取当前页面名称
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // 根据当前页面确定可编辑的内容块
        let contentSections = [];
        
        // 通用的标题、段落等选择器
        const commonSelectors = 'h1, h2, h3, h4, h5, h6, p, ul, ol, li, address';
        
        if (currentPage === 'index.html') {
            // 首页包含所有部分
            contentSections = [
                '#about ' + commonSelectors,
                '#pi ' + commonSelectors,
                '#students ' + commonSelectors,
                '#research ' + commonSelectors,
                '#contact ' + commonSelectors
            ];
        } else if (currentPage === 'about.html') {
            contentSections = ['#about ' + commonSelectors];
        } else if (currentPage === 'pi.html') {
            contentSections = ['#pi ' + commonSelectors];
        } else if (currentPage === 'students.html') {
            contentSections = ['#students ' + commonSelectors, '.student-card'];
        } else if (currentPage === 'research.html') {
            contentSections = ['#research ' + commonSelectors, '.project-card'];
        } else if (currentPage === 'contact.html') {
            contentSections = ['#contact ' + commonSelectors];
        }

        contentSections.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                if (!element.classList.contains('editable-content')) {
                    element.classList.add('editable-content');
                    element.dataset.originalContent = element.innerHTML;
                    element.style.border = '1px dashed #4CAF50';
                    element.style.padding = '5px';
                    element.style.cursor = 'pointer';
                    this.editableElements.push(element);
                }
            });
        });
    }

    disableEditing() {
        this.editableElements.forEach(element => {
            element.classList.remove('editable-content');
            element.style.border = '';
            element.style.padding = '';
            element.style.cursor = '';
        });
        this.editableElements = [];
    }

    startEditing(element) {
        this.currentEditingElement = element;
        const originalContent = element.innerHTML;
        
        // 创建编辑界面
        const editorContainer = document.createElement('div');
        editorContainer.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        editorContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">编辑内容</h3>
                    <button id="close-editor" class="text-gray-500 hover:text-gray-700">
                        <i class="fa fa-times text-xl"></i>
                    </button>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">内容 (支持HTML)</label>
                    <textarea id="content-editor" class="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" rows="10">${originalContent}</textarea>
                </div>
                <div class="flex justify-end gap-2">
                    <button id="cancel-edit" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">取消</button>
                    <button id="save-edit" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(editorContainer);
        
        // 绑定编辑界面事件
        document.getElementById('close-editor').addEventListener('click', () => this.cancelEditing());
        document.getElementById('cancel-edit').addEventListener('click', () => this.cancelEditing());
        document.getElementById('save-edit').addEventListener('click', () => this.saveEditing());
        
        // 聚焦到编辑器
        document.getElementById('content-editor').focus();
    }

    cancelEditing() {
        const editorContainer = document.querySelector('.fixed.inset-0.bg-black\/50');
        if (editorContainer) {
            document.body.removeChild(editorContainer);
        }
        this.currentEditingElement = null;
    }

    saveEditing() {
        const newContent = document.getElementById('content-editor').value;
        if (this.currentEditingElement && newContent !== undefined) {
            this.currentEditingElement.innerHTML = newContent;
            this.currentEditingElement.dataset.lastEdited = new Date().toISOString();
            
            // 显示保存成功提示
            this.showNotification('内容已成功保存！', 'success');
        }
        this.cancelEditing();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-blue-500';
        
        notification.className = `fixed top-20 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 opacity-0 translate-y-[-10px]`;
        notification.innerHTML = `<i class="fa fa-${type === 'success' ? 'check-circle' : 'info-circle'} mr-2"></i>${message}`;
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translate(-50%, 0)';
        }, 100);
        
        // 3秒后隐藏通知
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translate(-50%, -10px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 导出当前页面内容的JSON
    exportContent() {
        const content = {};
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // 根据当前页面确定要导出的内容
        let sections = [];
        
        if (currentPage === 'index.html') {
            // 首页导出所有部分
            sections = ['about', 'pi', 'students', 'research', 'contact'];
        } else {
            // 其他页面只导出对应部分
            sections = [currentPage.replace('.html', '')];
        }
        
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                content[section] = element.innerHTML;
            }
        });
        
        // 添加页面信息
        content.pageInfo = {
            page: currentPage,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const jsonString = JSON.stringify(content, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab-content-${currentPage.replace('.html', '')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('内容已导出！', 'success');
    }
}

// 初始化内容编辑器
window.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保页面完全加载
    setTimeout(() => {
        window.contentEditor = new ContentEditor();
    }, 1000);
});