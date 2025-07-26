// Francis CRM Extension - Content Script
class FrancisCRMInjector {
    constructor() {
        this.lastInjectedResponse = null;
        this.init();
    }

    init() {
        this.createFloatingWidget();
        this.detectCRMFields();
        this.setupMessageListener();
        console.log('Francis CRM Injector initialized on:', window.location.hostname);
    }

    createFloatingWidget() {
        // Create floating Francis button
        const widget = document.createElement('div');
        widget.id = 'francis-crm-widget';
        widget.innerHTML = `
            <div class="francis-widget-btn" title="Ouvrir Francis CRM Assistant">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <svg class="euro-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14.5 2c0 6-4 12-4 12s4 6 4 12"/>
                    <path d="M8.5 8h7"/>
                    <path d="M8.5 16h7"/>
                </svg>
            </div>
        `;
        
        widget.addEventListener('click', () => {
            // Open extension popup by sending message to background script
            chrome.runtime.sendMessage({ action: 'openPopup' });
        });
        
        document.body.appendChild(widget);
    }

    detectCRMFields() {
        // Enhanced CRM field detection
        const crmSelectors = {
            salesforce: [
                'textarea[id*="description"]',
                'textarea[id*="comment"]',
                'div[role="textbox"]',
                '.ql-editor',
                'textarea.textarea'
            ],
            hubspot: [
                'textarea[data-field="description"]',
                'div[contenteditable="true"]',
                'textarea[name*="notes"]',
                '.editor-wrapper textarea'
            ],
            pipedrive: [
                'textarea[name="notes"]',
                'div[contenteditable="true"]',
                'textarea[placeholder*="note"]'
            ],
            zoho: [
                'textarea[id*="Description"]',
                'div[contenteditable="true"]',
                'textarea.textAreaField'
            ],
            monday: [
                'div[contenteditable="true"]',
                'textarea[placeholder*="Add update"]',
                '.text-input textarea'
            ],
            notion: [
                'div[contenteditable="true"]',
                '.notion-page-content div[contenteditable="true"]'
            ],
            airtable: [
                'div[contenteditable="true"]',
                'textarea[placeholder*="notes"]'
            ],
            clickup: [
                'div[contenteditable="true"]',
                'textarea[placeholder*="description"]',
                '.ql-editor'
            ]
        };

        const hostname = window.location.hostname;
        let relevantSelectors = [];

        // Detect CRM platform and use specific selectors
        Object.keys(crmSelectors).forEach(crm => {
            if (hostname.includes(crm)) {
                relevantSelectors = crmSelectors[crm];
            }
        });

        // Add generic selectors as fallback
        relevantSelectors = relevantSelectors.concat([
            'textarea[name*="description"]',
            'textarea[name*="comment"]', 
            'textarea[name*="note"]',
            'textarea[name*="body"]',
            'input[name*="subject"]',
            'div[contenteditable="true"]',
            '.ql-editor',
            '.fr-element',
            '[data-testid*="text"]',
            'textarea:not([type="hidden"]):not([readonly])',
            'input[type="text"]:not([readonly])'
        ]);

        // Highlight detected fields on hover (for debugging)
        relevantSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(field => {
                field.addEventListener('mouseenter', () => {
                    field.style.outline = '2px dashed #c5a572';
                    field.style.outlineOffset = '1px';
                });
                field.addEventListener('mouseleave', () => {
                    field.style.outline = '';
                    field.style.outlineOffset = '';
                });
            });
        });

        return relevantSelectors;
    }

    setupMessageListener() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'injectResponse') {
                this.injectResponseToField(request.response);
                sendResponse({ success: true });
            } else if (request.action === 'detectFields') {
                const fields = this.getAvailableFields();
                sendResponse({ fields: fields });
            }
        });
    }

    getAvailableFields() {
        const selectors = this.detectCRMFields();
        const fields = [];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach((field, index) => {
                const fieldInfo = {
                    selector: selector,
                    index: index,
                    tagName: field.tagName,
                    type: field.type || 'contenteditable',
                    placeholder: field.placeholder || '',
                    name: field.name || '',
                    id: field.id || '',
                    visible: this.isElementVisible(field)
                };
                fields.push(fieldInfo);
            });
        });
        
        return fields;
    }

    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               window.getComputedStyle(element).visibility !== 'hidden' &&
               window.getComputedStyle(element).display !== 'none';
    }

    injectResponseToField(response) {
        // Find the best target field
        const targetField = this.findBestTargetField();
        
        if (targetField) {
            this.injectTextToField(targetField, response);
            this.showInjectionSuccess(targetField);
            this.lastInjectedResponse = response;
        } else {
            this.showInjectionError();
        }
    }

    findBestTargetField() {
        // Priority order for field selection
        const priorities = [
            // Currently focused field
            () => document.activeElement && 
                  (document.activeElement.tagName === 'TEXTAREA' || 
                   document.activeElement.tagName === 'INPUT' ||
                   document.activeElement.contentEditable === 'true') ? 
                  document.activeElement : null,
            
            // CRM-specific high-priority fields
            () => document.querySelector('textarea[name*="description"]'),
            () => document.querySelector('div[contenteditable="true"]'),
            () => document.querySelector('textarea[name*="comment"]'),
            () => document.querySelector('textarea[name*="note"]'),
            () => document.querySelector('.ql-editor'),
            () => document.querySelector('textarea:not([type="hidden"]):not([readonly])'),
            
            // Fallback to any visible text field
            () => {
                const fields = document.querySelectorAll('textarea, input[type="text"], div[contenteditable="true"]');
                for (const field of fields) {
                    if (this.isElementVisible(field) && !field.readOnly && !field.disabled) {
                        return field;
                    }
                }
                return null;
            }
        ];

        for (const findField of priorities) {
            const field = findField();
            if (field) return field;
        }

        return null;
    }

    injectTextToField(field, text) {
        if (field.contentEditable === 'true' || field.tagName === 'DIV') {
            // Rich text editor
            const currentContent = field.innerHTML;
            const newContent = currentContent + (currentContent ? '<br><br>' : '') + text.replace(/\n/g, '<br>');
            field.innerHTML = newContent;
            
            // Trigger events for rich text editors
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new Event('keyup', { bubbles: true }));
            
        } else if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
            // Regular input/textarea
            const currentValue = field.value;
            field.value = currentValue + (currentValue ? '\n\n' : '') + text;
            
            // Trigger events
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new Event('keyup', { bubbles: true }));
            
            // Set cursor to end
            field.setSelectionRange(field.value.length, field.value.length);
        }
        
        // Focus the field
        field.focus();
    }

    showInjectionSuccess(field) {
        // Visual feedback for successful injection
        const originalOutline = field.style.outline;
        const originalOutlineOffset = field.style.outlineOffset;
        
        field.style.outline = '3px solid #4CAF50';
        field.style.outlineOffset = '2px';
        
        // Create success notification
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                Réponse Francis injectée avec succès !
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove effects after delay
        setTimeout(() => {
            field.style.outline = originalOutline;
            field.style.outlineOffset = originalOutlineOffset;
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    showInjectionError() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f44336;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Aucun champ de texte détecté pour l'injection
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
}

// Initialize when DOM loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FrancisCRMInjector();
    });
} else {
    new FrancisCRMInjector();
}
