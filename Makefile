test:
	@./node_modules/.bin/mocha --globals exportscoffeeScript --require ./test/init.js test/*.test.js
test-verbose:
	@./node_modules/.bin/mocha --globals exportscoffeeScript --reporter spec --require ./test/init.js  test/*.test.js
testing:
	./node_modules/.bin/mocha --watch --globals exportscoffeeScript --reporter min --require ./test/init.js --require should test/*.test.js

.PHONY: test
