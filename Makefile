
COMPONENT = node_modules/component/bin/component
UGLIFY = node_modules/uglify-js/bin/uglifyjs
PHANTOM = node_modules/.bin/mocha-phantomjs

build: components lib/*.js
	@component build --dev

components: component.json
	@component install --dev

landmark.js: components
	$(COMPONENT) build --standalone landmark --out . --name landmark
	$(UGLIFY) landmark.js --output landmark.min.js

test: build
	$(PHANTOM) test/index.html

clean:
	rm -fr build components template.js

.PHONY: clean test
