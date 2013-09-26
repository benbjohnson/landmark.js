
COMPONENT = node_modules/component/bin/component
UGLIFY = node_modules/uglify-js/bin/uglifyjs

build: components lib/*.js
	@component build --dev

components: component.json
	@component install --dev

landmark.js: components
	$(COMPONENT) build --standalone landmark --out . --name landmark
	$(UGLIFY) landmark.js --output landmark.min.js

test: build
	@mocha

clean:
	rm -fr build components template.js

.PHONY: clean test
