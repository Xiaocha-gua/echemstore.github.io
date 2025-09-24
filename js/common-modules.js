// 公共模块加载器
class CommonModules {
    constructor() {
        this.modulesPath = 'includes/common-modules.html';
    }

    // 加载公共模块HTML内容
    async loadModules() {
        try {
            const response = await fetch(this.modulesPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            return this.parseModules(html);
        } catch (error) {
            console.error('加载公共模块失败:', error);
            return null;
        }
    }

    // 解析模块HTML内容
    parseModules(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        return {
            header: doc.querySelector('header.top-bar'),
            navigation: doc.querySelector('nav.main-nav'),
            contact: doc.querySelector('.product-contact'),
            footer: doc.querySelector('footer.footer'),
            script: doc.querySelector('script')
        };
    }

    // 优化的模块插入方法 - 使用innerHTML替换占位符
    insertModules(modules) {
        // 批量替换占位符，减少DOM操作次数
        const replacements = [
            { id: 'top-bar-placeholder', content: modules.header?.outerHTML || '' },
            { id: 'main-nav-placeholder', content: modules.navigation?.outerHTML || '' },
            { id: 'contact-section-placeholder', content: modules.contact?.outerHTML || '' },
            { id: 'footer-placeholder', content: modules.footer?.outerHTML || '' }
        ];

        // 使用DocumentFragment批量更新DOM
        replacements.forEach(({ id, content }) => {
            const placeholder = document.getElementById(id);
            if (placeholder && content) {
                placeholder.innerHTML = content;
            }
        });

        // 设置语言切换功能
        this.setupLanguageSwitch();
    }

    // 设置语言切换功能
    setupLanguageSwitch() {
        const langSwitchBtn = document.getElementById('lang-switch-btn');
        if (langSwitchBtn) {
            // 获取当前页面文件名
            const currentPage = window.location.pathname.split('/').pop();
            
            // 中文页面到英文页面的映射
            const pageMapping = {
                'product-anion-membrane.html': 'product-anion-membrane-en.html',
                'product-zsm-membrane.html': 'product-zsm-membrane-en.html',
                'product-pps-membrane.html': 'product-pps-membrane-en.html',
                'product-carbon-paper.html': 'product-carbon-paper-en.html',
                'product-electrolytic-cell.html': 'product-electrolytic-cell-en.html',
                'product-porous-diffusion-layer.html': 'product-porous-diffusion-layer-en.html',
                'product-desktop-system.html': 'product-desktop-system-en.html',
                'product-bench-hydrogen-system.html': 'product-bench-hydrogen-system-en.html',
                'product-multichannel-hydrogen-system.html': 'product-multichannel-hydrogen-system-en.html',
                'product-co2-electrolysis-system.html': 'product-co2-electrolysis-system-en.html',
                'product-homogenizer.html': 'product-homogenizer-en.html',
                'product-joule-heating.html': 'product-joule-heating-en.html',
                'product-pem-test-system.html': 'product-pem-test-system-en.html',
                'product-non-metallic-frame.html': 'product-non-metallic-frame-en.html',
                'service-lca.html': 'service-lca-en.html',
                'service-tea.html': 'service-tea-en.html',
                'service-database.html': 'service-database-en.html',
                'contact.html': 'contact-en.html',
                'index.html': 'index-en.html',
                'electrochemical-materials.html': 'electrochemical-materials-en.html',
                'electrochemical-testing-systems.html': 'electrochemical-testing-systems-en.html',
                'electrochemical-equipment.html': 'electrochemical-equipment-en.html',
                'technical-consulting-services.html': 'technical-consulting-services-en.html'
            };
            
            const englishPage = pageMapping[currentPage];
            if (englishPage) {
                langSwitchBtn.href = englishPage;
            }
        }
    }

    // 执行模块中的JavaScript代码
    executeModuleScript(modules) {
        if (modules.script) {
            const scriptContent = modules.script.textContent;
            if (scriptContent.trim()) {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = scriptContent;
                document.head.appendChild(scriptElement);
            }
        }
    }

    // 初始化所有模块 - 优化版本
    async init() {
        const modules = await this.loadModules();
        if (modules) {
            // 使用优化的插入方法
            this.insertModules(modules);
            this.executeModuleScript(modules);
            
            // 触发自定义事件，通知模块加载完成
            document.dispatchEvent(new CustomEvent('commonModulesLoaded'));
        }
    }
}

// 页面加载完成后立即初始化公共模块
document.addEventListener('DOMContentLoaded', function() {
    const commonModules = new CommonModules();
    commonModules.init();
});