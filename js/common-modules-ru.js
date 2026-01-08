/**
 * Russian Common Modules Loader
 * Dynamically loads and inserts common page modules for Russian pages
 */

class RussianCommonModulesLoader {
    constructor() {
        this.rootPath = this.determineRootPath();
        // Add timestamp to prevent caching of the HTML file
        this.modulesPath = this.rootPath + 'includes/common-modules-ru.html?t=' + new Date().getTime();
        this.modules = {};
        this.isLoaded = false;
    }

    determineRootPath() {
        const script = document.currentScript || document.querySelector('script[src*="common-modules-ru.js"]');
        if (script) {
            const src = script.getAttribute('src');
            const match = src.match(/^(.*)js\/common-modules-ru\.js/);
            if (match) {
                return match[1];
            }
        }
        return '';
    }

    async loadModules() {
        try {
            const response = await fetch(this.modulesPath);
            if (!response.ok) {
                throw new Error(`Failed to load modules: ${response.status}`);
            }
            
            const html = await response.text();
            this.parseModules(html);
            this.isLoaded = true;
            
            console.log('Russian common modules loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading Russian common modules:', error);
            return false;
        }
    }

    parseModules(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        this.rewriteLinks(doc);
        
        this.modules.topBar = doc.getElementById('top-bar-module');
        this.modules.mainNav = doc.getElementById('main-nav-module');
        this.modules.contactSection = doc.getElementById('contact-section-module');
        this.modules.footer = doc.getElementById('footer-module');
    }

    rewriteLinks(doc) {
        const rewrite = (el, attr) => {
            const val = el.getAttribute(attr);
            if (val && !val.startsWith('http') && !val.startsWith('#') && !val.startsWith('mailto:') && !val.startsWith('javascript:')) {
                let newVal = val;
                if (newVal.startsWith('./')) {
                    newVal = newVal.substring(2);
                }
                el.setAttribute(attr, this.rootPath + newVal);
            }
        };

        doc.querySelectorAll('[href]').forEach(el => rewrite(el, 'href'));
        doc.querySelectorAll('[src]').forEach(el => rewrite(el, 'src'));
    }

    insertTopBar() {
        const placeholder = document.getElementById('top-bar-placeholder');
        if (placeholder && this.modules.topBar) {
            placeholder.replaceWith(this.modules.topBar.cloneNode(true));
            this.setupLanguageSwitch();
        }
    }

    insertMainNav() {
        const placeholder = document.getElementById('main-nav-placeholder');
        if (placeholder && this.modules.mainNav) {
            placeholder.replaceWith(this.modules.mainNav.cloneNode(true));
        }
    }

    insertContactSection() {
        const placeholder = document.getElementById('contact-section-placeholder');
        if (placeholder && this.modules.contactSection) {
            placeholder.replaceWith(this.modules.contactSection.cloneNode(true));
        }
    }

    insertFooter() {
        const placeholder = document.getElementById('footer-placeholder');
        if (placeholder && this.modules.footer) {
            placeholder.replaceWith(this.modules.footer.cloneNode(true));
        }
    }

    setupLanguageSwitch() {
        // Update language links to stay on current page
        const langLinks = document.querySelectorAll('.language-menu a');
        if (langLinks.length > 0) {
            langLinks.forEach(link => {
                const text = link.textContent.trim();
                let targetFile = 'index.html';
                
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
        }

        const langSwitch = document.querySelector('.language-switch');
        if (langSwitch) {
            const btn = langSwitch.querySelector('.lang-btn');
            const menu = langSwitch.querySelector('.language-menu');
            
            if (btn && menu) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    menu.classList.toggle('show');
                    langSwitch.classList.toggle('active');
                });

                document.addEventListener('click', (e) => {
                    if (!langSwitch.contains(e.target)) {
                        menu.classList.remove('show');
                        langSwitch.classList.remove('active');
                    }
                });
            }
        }
    }

    executeModuleScripts() {
        const scripts = document.querySelectorAll('#top-bar-module script, #main-nav-module script, #contact-section-module script, #footer-module script');
        scripts.forEach(script => {
            if (script.textContent) {
                try {
                    eval(script.textContent);
                } catch (error) {
                    console.error('Error executing module script:', error);
                }
            }
        });
    }

    async init() {
        const loaded = await this.loadModules();
        if (!loaded) return;

        this.insertTopBar();
        this.insertMainNav();
        this.insertContactSection();
        this.insertFooter();
        this.executeModuleScripts();
        
        document.dispatchEvent(new CustomEvent('russianModulesLoaded'));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const loader = new RussianCommonModulesLoader();
    loader.init();
});

window.RussianCommonModulesLoader = RussianCommonModulesLoader;
