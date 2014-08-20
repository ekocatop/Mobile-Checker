var Browser = require("../lib/mobile-browser-emulator").Browser
,   expect = require("expect.js")
,   webdriver = require('selenium-webdriver');


describe("Starting and quiting browser", function () {
    it('should start and stop without error with correct proxy', function (done) {
        var browser = new Browser({port:8080, trackNetwork: true});
        browser.on('error', function (msg) {
            expect().fail(msg);
            done();
        });
        browser.open("file://" + __dirname + "/browser-tests/ok.html");
        browser.do( function () {
            done();
            return webdriver.promise.fulfilled();
        });
    });

    it('should emit an error with incorrect proxy', function (done) {
        var browser = new Browser({browsermobProxy: {port:8081}, trackNetwork: true});
        browser.on('error', function (err) {
            expect(err.message).to.be('Failed gathering network traffic: Error: connect ECONNREFUSED');
            done();
        });
        browser.open("file://" + __dirname + "/browser-tests/ok.html");
    });

});

describe("Getting data from browser", function () {
    var browser = new Browser();

    it('should return the title of the page "OK"', function (done) {
        browser.open("file://" + __dirname + "/browser-tests/ok.html");
        browser.do( function (driver) {
            return driver.findElement(webdriver.By.tagName('title')).then(function (title) {
                title.getInnerHtml().then(function (titleText) {
                    expect(titleText).to.be('OK');
                    done();
                });
            });
        });

    });

    it('should return the title of the page "OK", even with an alert', function (done) {
        browser.open("file://" + __dirname + "/browser-tests/alert.html");
        browser.do( function (driver) {
            return driver.findElement(webdriver.By.tagName('title')).then(function (title) {
                title.getInnerHtml().then(function (titleText) {
                    expect(titleText).to.be('Alert');
                    done();
                });
            });
        });

    });

});

describe("Getting data from network", function () {
    var server = require("./test_server/test_app.js");
    var browser = new Browser({browsermobProxy: {port:8080}, trackNetwork: true});

    before(function () {
        server.start(3001, '/../browser-tests');
    });

    it("should get the status code of a loadable page", function (done) {
        browser.on('har', function (har) {
            expect(har.log.entries[0].response.status).to.be(200);
            done();
        });
        browser.open("http://localhost:3001/ok.html");
    });

    after(function () {
        server.close();
    });
});