// Francis CRM Extension - Background Script
class FrancisBackground {
    constructor() {
        this.init();
    }

    init() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            if (details.reason === 'install') {
                this.onInstall();
            } else if (details.reason === 'update') {
                this.onUpdate();
            }
        });

        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Handle browser action click
        chrome.action.onClicked.addListener((tab) => {
            this.openPopup(tab);
        });

        console.log('Francis CRM Background Script initialized');
    }

    onInstall() {
        // Set default configuration
        chrome.storage.sync.set({
            apiUrl: 'https://fiscal.ia/api',
            apiKey: null,
            autoInject: false,
            voiceEnabled: true
        });

        // Open welcome/setup page
        chrome.tabs.create({
            url: chrome.runtime.getURL('welcome.html')
        });
    }

    onUpdate() {
        // Handle extension updates
        console.log('Francis CRM Extension updated');
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'openPopup':
                    await this.openPopup();
                    sendResponse({ success: true });
                    break;

                case 'getConfig':
                    const config = await chrome.storage.sync.get(['apiUrl', 'apiKey', 'autoInject', 'voiceEnabled']);
                    sendResponse({ config });
                    break;

                case 'saveConfig':
                    await chrome.storage.sync.set(request.config);
                    sendResponse({ success: true });
                    break;

                case 'testConnection':
                    const result = await this.testFrancisConnection(request.apiUrl, request.apiKey);
                    sendResponse({ success: result.success, error: result.error });
                    break;

                case 'injectToCRM':
                    await this.injectResponseToCRM(sender.tab.id, request.response);
                    sendResponse({ success: true });
                    break;

                case 'detectCRM':
                    const crmInfo = await this.detectCRMPlatform(sender.tab.url);
                    sendResponse({ crm: crmInfo });
                    break;

                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background script error:', error);
            sendResponse({ error: error.message });
        }
    }

    async openPopup(tab) {
        try {
            // The popup will open automatically when user clicks the extension icon
            // This method is mainly for programmatic opening from content scripts
            console.log('Opening Francis popup');
        } catch (error) {
            console.error('Error opening popup:', error);
        }
    }

    async testFrancisConnection(apiUrl, apiKey) {
        try {
            const response = await fetch(`${apiUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
                }
            });

            if (response.ok) {
                return { success: true };
            } else {
                return { success: false, error: `HTTP ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async injectResponseToCRM(tabId, response) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: (response) => {
                    // This will be executed in the content script context
                    if (window.francisInjector) {
                        window.francisInjector.injectResponseToField(response);
                    }
                },
                args: [response]
            });
        } catch (error) {
            console.error('Error injecting to CRM:', error);
            throw error;
        }
    }

    detectCRMPlatform(url) {
        const hostname = new URL(url).hostname.toLowerCase();
        
        const crmPlatforms = {
            'salesforce.com': {
                name: 'Salesforce',
                color: '#1798c1',
                fields: ['textarea[id*="description"]', 'div[role="textbox"]', '.ql-editor']
            },
            'hubspot.com': {
                name: 'HubSpot',
                color: '#ff7a59',
                fields: ['textarea[data-field="description"]', 'div[contenteditable="true"]']
            },
            'pipedrive.com': {
                name: 'Pipedrive',
                color: '#28a745',
                fields: ['textarea[name="notes"]', 'div[contenteditable="true"]']
            },
            'zoho.com': {
                name: 'Zoho CRM',
                color: '#e74c3c',
                fields: ['textarea[id*="Description"]', 'div[contenteditable="true"]']
            },
            'monday.com': {
                name: 'Monday.com',
                color: '#6c5ce7',
                fields: ['div[contenteditable="true"]', 'textarea[placeholder*="Add update"]']
            },
            'airtable.com': {
                name: 'Airtable',
                color: '#18bfff',
                fields: ['div[contenteditable="true"]', 'textarea[placeholder*="notes"]']
            },
            'notion.so': {
                name: 'Notion',
                color: '#000000',
                fields: ['div[contenteditable="true"]']
            },
            'clickup.com': {
                name: 'ClickUp',
                color: '#7b68ee',
                fields: ['div[contenteditable="true"]', '.ql-editor']
            }
        };

        for (const [domain, info] of Object.entries(crmPlatforms)) {
            if (hostname.includes(domain.replace('.com', ''))) {
                return info;
            }
        }

        return {
            name: 'Generic',
            color: '#c5a572',
            fields: ['textarea', 'div[contenteditable="true"]', 'input[type="text"]']
        };
    }

    // Utility method to check if current page is a CRM
    async isCRMPage(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            const crmInfo = this.detectCRMPlatform(tab.url);
            return crmInfo.name !== 'Generic';
        } catch (error) {
            return false;
        }
    }

    // Badge management
    async updateBadge(tabId, text, color = '#c5a572') {
        try {
            await chrome.action.setBadgeText({
                text: text,
                tabId: tabId
            });
            await chrome.action.setBadgeBackgroundColor({
                color: color,
                tabId: tabId
            });
        } catch (error) {
            console.error('Error updating badge:', error);
        }
    }
}

// Initialize background script
new FrancisBackground();
