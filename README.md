# Atomist 'travis-handlers'
[![Build Status](https://travis-ci.org/atomist-rugs/travis-handlers.svg?branch=master)](https://travis-ci.org/atomist-rugs/travis-handlers)
[![Slack Status](https://join.atomist.com/badge.svg)](https://join.atomist.com/)

A set of Rug _handlers_ that that deal with Travis CI

Read read more about this at [Automating Our Development Flow With Atomist](https://medium.com/the-composition/automating-our-development-flow-with-atomist-6b0ec73348b6#.hwa55uv8o).

## Developing

A very clean build and test:

```
$ ( cd .atomist && \rm -rf node_modules && npm install ) && find .atomist/{handlers,tests} -name '*.js' -print0 | xargs -0 rm && rug clean && rug test -urX
```
