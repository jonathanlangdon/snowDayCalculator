import { getWeatherUrl } from './api';
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

describe('Basic Tests', () => {
  describe('Correct URL setup', () => {
    it('should correctly put latitude & longitude in URL', () => {
      // Create a mock DOM environment
      const dom = new JSDOM(`
        <html>
        <body>
          <input type="text" id="latitude" value="43" />
          <input type="text" id="longitude" value="-86" />
        </body>
        </html>
      `);

      // Set up global variables
      global.document = dom.window.document;

      // Act
      const actual = getWeatherUrl();

      // Assert
      expect(actual).toEqual([
        `https://api.weather.gov/points/43,-86`,
        `https://api.weather.gov/alerts/active?point=43,-86`
      ]);

      // Clean up
      delete global.document;
    });
  });
});
