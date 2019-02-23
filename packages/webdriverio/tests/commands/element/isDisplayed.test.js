import request from 'request'
import { remote } from '../../../src'
jest.mock('../../../src/scripts/isElementDisplayed', () => ({
    __esModule: true,
    default: function () { return true }
}))

describe('isDisplayed test', () => {
    let browser
    let elem

    beforeEach(async () => {
        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar'
            }
        })
        elem = await browser.$('#foo')
        request.mockClear()
    })

    it('should allow to check if element is displayed', async () => {
        expect(await elem.isDisplayed()).toBe(true)
        expect(request).toBeCalledTimes(1)
        expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/execute/sync')
        expect(request.mock.calls[0][0].body.args[0]).toEqual({
            'element-6066-11e4-a52e-4f735466cecf': 'some-elem-123',
            ELEMENT: 'some-elem-123'
        })
    })

    it('should refetch element if non existing', async () => {
        delete elem.elementId
        expect(await elem.isDisplayed()).toBe(true)
        expect(request).toBeCalledTimes(2)
        expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element')
        expect(request.mock.calls[1][0].uri.path).toBe('/wd/hub/session/foobar-123/execute/sync')
        expect(request.mock.calls[1][0].body.args[0]).toEqual({
            'element-6066-11e4-a52e-4f735466cecf': 'some-elem-123',
            ELEMENT: 'some-elem-123'
        })
    })

    it('should return false if element can\'t be found after refetching it', async () => {
        const elem = await browser.$('#nonexisting')
        expect(await elem.isDisplayed()).toBe(false)
        expect(request).toBeCalledTimes(2)
    })

    it('should hit the api if chrome', async () => {
        browser = await remote({
            baseUrl: 'http://foobar.com',
            capabilities: {
                browserName: 'foobar',
                chromeMode: true
            }
        })
        elem = await browser.$('#foo')
        request.mockClear()

        expect(await elem.isDisplayed()).toBe(true)
        expect(request).toBeCalledTimes(1)
        expect(request.mock.calls[0][0].uri.path).toBe('/wd/hub/session/foobar-123/element/some-elem-123/displayed')
    })
})
