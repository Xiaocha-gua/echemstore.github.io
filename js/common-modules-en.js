/**
 * English Common Modules Loader
 * Dynamically loads and inserts common page modules for English pages
 */

class EnglishCommonModulesLoader {
    constructor() {
        this.modulesPath = 'includes/common-modules-en.html';
        this.modules = {};
        this.isLoaded = false;
    }

    /**
     * Load common modules HTML content
     */
    async loadModules() {
        try {
            const response = await fetch(this.modulesPath);
            if (!response.ok) {
                throw new Error(`Failed to load modules: ${response.status}`);
            }
            
            const html = await response.text();
            this.parseModules(html);
            this.isLoaded = true;
            
            console.log('English common modules loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading English common modules:', error);
            return false;
        }
    }

    /**
     * Parse HTML content and extract individual modules
     */
    parseModules(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract each module
        this.modules.topBar = doc.getElementById('top-bar-module');
        this.modules.mainNav = doc.getElementById('main-nav-module');
        this.modules.contactSection = doc.getElementById('contact-section-module');
        this.modules.footer = doc.getElementById('footer-module');
        
        console.log('Parsed modules:', Object.keys(this.modules));
    }

    /**
     * Insert top bar module
     */
    insertTopBar() {
        const placeholder = document.getElementById('top-bar-placeholder');
        if (placeholder && this.modules.topBar) {
            placeholder.replaceWith(this.modules.topBar.cloneNode(true));
            this.setupLanguageSwitch();
            console.log('Top bar inserted');
        }
    }

    /**
     * Insert main navigation module
     */
    insertMainNav() {
        const placeholder = document.getElementById('main-nav-placeholder');
        if (placeholder && this.modules.mainNav) {
            placeholder.replaceWith(this.modules.mainNav.cloneNode(true));
            console.log('Main navigation inserted');
        }
    }

    /**
     * Insert contact section module
     */
    insertContactSection() {
        const placeholder = document.getElementById('contact-section-placeholder');
        if (placeholder && this.modules.contactSection) {
            placeholder.replaceWith(this.modules.contactSection.cloneNode(true));
            console.log('Contact section inserted');
        }
    }

    /**
     * Insert footer module
     */
    insertFooter() {
        const placeholder = document.getElementById('footer-placeholder');
        if (placeholder && this.modules.footer) {
            placeholder.replaceWith(this.modules.footer.cloneNode(true));
            console.log('Footer inserted');
        }
    }

    /**
     * Setup language switch functionality
     */
    setupLanguageSwitch() {
        const langSwitchLink = document.getElementById('lang-switch-link');
        if (langSwitchLink) {
            // Get current page filename
            const currentPage = window.location.pathname.split('/').pop();
            
            // Map English pages to Chinese pages
            const pageMapping = {
                'product-anion-membrane-en.html': 'product-anion-membrane.html',
                'product-zsm-membrane-en.html': 'product-zsm-membrane.html',
                'product-pps-membrane-en.html': 'product-pps-membrane.html',
                'product-carbon-paper-en.html': 'product-carbon-paper.html',
                'product-electrolytic-cell-en.html': 'product-electrolytic-cell.html',
                'product-porous-diffusion-layer-en.html': 'product-porous-diffusion-layer.html',
                'product-desktop-system-en.html': 'product-desktop-system.html',
                'product-bench-hydrogen-system-en.html': 'product-bench-hydrogen-system.html',
                'product-multichannel-hydrogen-system-en.html': 'product-multichannel-hydrogen-system.html',
                'product-co2-electrolysis-system-en.html': 'product-co2-electrolysis-system.html',
                'product-homogenizer-en.html': 'product-homogenizer.html',
                'product-joule-heating-en.html': 'product-joule-heating.html',
                'product-pem-test-system-en.html': 'product-pem-test-system.html',
                'product-non-metallic-frame-en.html': 'product-non-metallic-frame.html',
                'service-lca-en.html': 'service-lca.html',
                'service-tea-en.html': 'service-tea.html',
                'service-database-en.html': 'service-database.html',
                'contact-en.html': 'contact.html',
                'index-en.html': 'index.html',
                'electrochemical-materials-en.html': 'electrochemical-materials.html',
                'electrochemical-testing-systems-en.html': 'electrochemical-testing-systems.html',
                'electrochemical-equipment-en.html': 'electrochemical-equipment.html',
                'technical-consulting-services-en.html': 'technical-consulting-services.html'
            };
            
            const chinesePage = pageMapping[currentPage];
            if (chinesePage) {
                langSwitchLink.href = chinesePage;
            }
        }
    }

    /**
     * Execute module scripts
     */
    executeModuleScripts() {
        // Find and execute scripts from the loaded modules
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

    /**
     * Initialize all modules
     */
    async init() {
        const loaded = await this.loadModules();
        if (!loaded) {
            console.error('Failed to load English common modules');
            return;
        }

        // Insert all modules
        this.insertTopBar();
        this.insertMainNav();
        this.insertContactSection();
        this.insertFooter();
        
        // Execute module scripts
        this.executeModuleScripts();
        
        // Setup language switch functionality
        this.setupLanguageSwitch();
        
        // Dispatch custom event to notify modules are loaded
        document.dispatchEvent(new CustomEvent('englishModulesLoaded'));
        
        console.log('All English common modules initialized successfully');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const loader = new EnglishCommonModulesLoader();
    loader.init();
});

// Export for potential external use
window.EnglishCommonModulesLoader = EnglishCommonModulesLoader;