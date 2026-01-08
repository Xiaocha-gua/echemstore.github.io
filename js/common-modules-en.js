/**
 * English Common Modules Loader
 * Dynamically loads and inserts common page modules for English pages
 * Based on the robust logic from common-modules.js
 */

class EnglishCommonModulesLoader {
    constructor() {
        this.rootPath = this.determineRootPath();
        // Hardcoded to English module
        this.modulesPath = this.rootPath + 'includes/common-modules-en.html';
    }

    determineRootPath() {
        // Try to find the script tag that loaded this file
        const script = document.currentScript || document.querySelector('script[src*="common-modules-en.js"]');
        if (script) {
            const src = script.getAttribute('src');
            // src should be like "../../js/common-modules-en.js" or "js/common-modules-en.js"
            const match = src.match(/^(.*)js\/common-modules-en\.js/);
            if (match) {
                return match[1]; // returns "../../" or ""
            }
        }
        return ''; // Default to root if detection fails
    }

    async loadModules() {
        try {
            const response = await fetch(this.modulesPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            return this.parseModules(html);
        } catch (error) {
            console.error('Failed to load English common modules:', error);
            return null;
        }
    }

    parseModules(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Rewrite all links to be relative to the current page's depth
        const rewriteAttribute = (el, attr) => {
            const val = el.getAttribute(attr);
            if (val && !val.startsWith('http') && !val.startsWith('//') && !val.startsWith('#') && !val.startsWith('mailto:') && !val.startsWith('javascript:')) {
                // Prepend rootPath. We don't strip './' because browsers handle '../.././' correctly.
                el.setAttribute(attr, this.rootPath + val);
            }
        };

        doc.querySelectorAll('[href]').forEach(el => rewriteAttribute(el, 'href'));
        doc.querySelectorAll('[src]').forEach(el => rewriteAttribute(el, 'src'));
        
        return {
            header: doc.querySelector('#top-bar-module') || doc.querySelector('header.top-bar'),
            navigation: doc.querySelector('#main-nav-module') || doc.querySelector('nav.main-nav'),
            contact: doc.querySelector('#contact-section-module') || doc.querySelector('.product-contact'),
            footer: doc.querySelector('#footer-module') || doc.querySelector('footer.footer'),
            scripts: doc.querySelectorAll('script')
        };
    }

    insertModules(modules) {
        // Use innerHTML to preserve the placeholder element (safer than replaceWith)
        const replacements = [
            { id: 'top-bar-placeholder', content: modules.header?.innerHTML || '' },
            { id: 'main-nav-placeholder', content: modules.navigation?.innerHTML || '' },
            { id: 'contact-section-placeholder', content: modules.contact?.innerHTML || '' },
            { id: 'footer-placeholder', content: modules.footer?.innerHTML || '' }
        ];

        replacements.forEach(({ id, content }) => {
            const placeholder = document.getElementById(id);
            if (placeholder && content) {
                placeholder.innerHTML = content;
            } else if (!placeholder) {
                // Optional: Log warning if placeholder is missing, but don't break
                // console.warn(`Placeholder #${id} not found`);
            }
        });

        this.setupLanguageSwitch();
    }

    setupLanguageSwitch() {
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

         // Handle main button behavior
         const langSwitchBtn = document.getElementById('lang-switch-link');
         if (langSwitchBtn) {
             langSwitchBtn.href = '#';
         }
    }

    executeModuleScripts(modules) {
        if (modules.scripts) {
            modules.scripts.forEach(script => {
                const scriptContent = script.textContent;
                if (scriptContent.trim()) {
                    const scriptElement = document.createElement('script');
                    scriptElement.textContent = scriptContent;
                    document.head.appendChild(scriptElement);
                }
            });
        }
    }

    async init() {
        const modules = await this.loadModules();
        if (modules) {
            this.insertModules(modules);
            this.executeModuleScripts(modules);
            document.dispatchEvent(new CustomEvent('englishModulesLoaded'));
            console.log('English common modules initialized successfully');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const loader = new EnglishCommonModulesLoader();
    loader.init();
});
