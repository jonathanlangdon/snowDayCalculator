import { displayError } from './utility';
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

describe('displayError function', () => {
  describe('correctly shows message', () => {
    it('should display a message', () => {
      // Create a mock DOM environment
      const dom = new JSDOM(`
        <html>
        <body>
            <p id="forecast-error"></p>
        </body>
        </html>
      `);

      // Set up global variables
      global.document = dom.window.document;
      const testMessage = 'This is a test';
      const targetElement = document.getElementById('forecast-error');

      // Act
      const actual = displayError(testMessage);

      // Assert
      expect(targetElement.innerText).toBe(testMessage);

      // Clean up
      delete global.document;
    });
  });
});
