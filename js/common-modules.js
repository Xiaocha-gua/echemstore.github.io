// 公共模块加载器
class CommonModules {
    constructor() {
        this.rootPath = this.determineRootPath();
        this.langSuffix = this.determineLanguage();
        // Construct path to the correct language module file
        // e.g. includes/common-modules-en.html
        const moduleFile = this.langSuffix ? `common-modules${this.langSuffix}.html` : 'common-modules.html';
        // Use a version string instead of timestamp to allow caching
        this.modulesPath = this.rootPath + 'includes/' + moduleFile + '?v=20260108';
    }

    determineRootPath() {
        // Try to find the script tag that loaded this file
        const script = document.currentScript || document.querySelector('script[src*="common-modules.js"]');
        if (script) {
            const src = script.getAttribute('src');
            // src should be like "../../js/common-modules.js" or "js/common-modules.js"
            const match = src.match(/^(.*)js\/common-modules\.js/);
            if (match) {
                return match[1]; // returns "../../" or ""
            }
        }
        return ''; // Default to root if detection fails
    }

    determineLanguage() {
        const fileName = window.location.pathname.split('/').pop() || 'index.html';
        // Check if filename is like "en.html"
        const parts = fileName.split('.');
        if (parts.length > 1) {
            const name = parts[0];
            const langs = ['en', 'de', 'fr', 'ru', 'pt', 'es', 'ar', 'ja', 'ko', 'hi'];
            if (langs.includes(name)) {
                return '-' + name;
            }
        }
        return ''; // Default (Chinese/Index)
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

    // 解析模块HTML内容并重写链接
    parseModules(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Rewrite all links to be relative to the current page's depth
        // The links in common-modules.html are relative to ROOT (e.g. products/abc/index.html)
        // We prepend rootPath (e.g. ../../)
        
        const rewriteAttribute = (el, attr) => {
            const val = el.getAttribute(attr);
            if (val && !val.startsWith('http') && !val.startsWith('#') && !val.startsWith('mailto:') && !val.startsWith('javascript:')) {
                // If it's not absolute, prepend rootPath
                el.setAttribute(attr, this.rootPath + val);
            }
        };

        doc.querySelectorAll('[href]').forEach(el => rewriteAttribute(el, 'href'));
        doc.querySelectorAll('[src]').forEach(el => rewriteAttribute(el, 'src'));
        
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
        // 批量替换占位符
        const replacements = [
            { id: 'top-bar-placeholder', content: modules.header?.outerHTML || '' },
            { id: 'main-nav-placeholder', content: modules.navigation?.outerHTML || '' },
            { id: 'contact-section-placeholder', content: modules.contact?.outerHTML || '' },
            { id: 'footer-placeholder', content: modules.footer?.outerHTML || '' }
        ];

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
        // Update language switcher links to point to sibling files (en.html, index.html)
        // instead of the hardcoded paths from common-modules.html
        
        const langLinks = document.querySelectorAll('.language-menu a');
        if (langLinks.length === 0) return;

        langLinks.forEach(link => {
            const text = link.textContent.trim();
            let targetFile = 'index.html'; // Default to Chinese
            
            if (text.includes('English')) targetFile = 'en.html';
            else if (text.includes('Russian') || text.includes('Русский')) targetFile = 'ru.html';
            else if (text.includes('French') || text.includes('Français')) targetFile = 'fr.html';
            else if (text.includes('German') || text.includes('Deutsch')) targetFile = 'de.html';
            else if (text.includes('Portuguese') || text.includes('Português')) targetFile = 'pt.html';
            else if (text.includes('Spanish') || text.includes('Español')) targetFile = 'es.html';
            else if (text.includes('Hindi') || text.includes('हिन्दी')) targetFile = 'hi.html';
            else if (text.includes('Arabic') || text.includes('العربية')) targetFile = 'ar.html';
            else if (text.includes('Japanese') || text.includes('日本語')) targetFile = 'ja.html';
            else if (text.includes('Korean') || text.includes('한국어')) targetFile = 'ko.html';
            else if (text.includes('Chinese') || text.includes('中文')) targetFile = 'index.html';
            
            link.href = targetFile;
        });

        // Handle main button
        const langSwitchBtn = document.getElementById('lang-switch-btn');
        if (langSwitchBtn) {
            // Optional: Set to next logical language or just '#' to trigger dropdown
             langSwitchBtn.href = '#';
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

    // 初始化所有模块
    async init() {
        const modules = await this.loadModules();
        if (modules) {
            this.insertModules(modules);
            this.executeModuleScript(modules);
            document.dispatchEvent(new CustomEvent('commonModulesLoaded'));
        }
    }
}

// 页面加载完成后立即初始化公共模块
document.addEventListener('DOMContentLoaded', function() {
    const commonModules = new CommonModules();
    commonModules.init();
});
