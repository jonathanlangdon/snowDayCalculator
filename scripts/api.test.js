import { it, expect, describe, beforeEach, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { handleTemperatureForecast } from './api.js'

const { window } = new JSDOM('<!doctype html><html><body></body></html>')
global.document = window.document

describe('handleTemperatureForecast', () => {
  let tempElement

  // Setup a mock for the DOM element before each test
  beforeEach(() => {
    tempElement = document.createElement('input')
    tempElement.id = 'temp'
    document.body.appendChild(tempElement)
  })

  // Cleanup after each test
  afterEach(() => {
    document.body.removeChild(tempElement)
  })

  it('should return the proper feel-like temp for given data', () => {
    const hourlyData = {
      properties: {
        periods: [
          {
            startTime: '2023-12-03T07:00',
            temperature: '15',
            windSpeed: '10 mph'
          }
        ]
      }
    }
    const expectedResult = '3'
    const result = handleTemperatureForecast(hourlyData)
    expect(tempElement.value).toBe(expectedResult)
  })
})
