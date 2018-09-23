// NOTE: detail is not accessible from page, so you can't put anything useful
// in here anyway (otherwise you get an 'access denied error')
browser.tabs.executeScript({
  code: `document.dispatchEvent(new CustomEvent('extension-installed', { detail: { }	}));`,
});
