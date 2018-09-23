window.BrowserDetector = {

  // Opera 8.0+
  isOpera: (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,

  // Firefox 1.0+
  isFirefox: typeof InstallTrigger !== 'undefined',

  // Safari 3.0+ "[object HTMLElementConstructor]" 
  isSafari: /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification),

  // Internet Explorer 6-11
  isIE: /*@cc_on!@*/false || !!document.documentMode,

  // Edge 20+
  isEdge: !this.isIE && !!window.StyleMedia,

  // Chrome 1+
  isChrome: !!window.chrome && !!window.chrome.webstore,

  // Blink engine detection
  isBlink: (this.isChrome || this.isOpera) && !!window.CSS,

  getBrowserName() {
    if (this.isSafari) {
      return 'safari';
    }
    if (this.isFirefox) {
      return 'firefox';
    }
    if (this.isChrome) {
      return 'chrome';
    }
    if (this.isEdge) {
      return 'ms-edge';
    }
    if (this.isIE) {
      return 'ms-ie';
    }
  },
};