# Atomist 'travis-handlers'

[![Build Status](https://travis-ci.org/atomist/travis-handlers.svg?branch=master)](https://travis-ci.org/atomist/travis-handlers)
[![Slack Status](https://join.atomist.com/badge.svg)](https://join.atomist.com/)

A set of Rug _handlers_ that that deal with Travis CI

Read read more about this at [Automating Our Development Flow With Atomist](https://medium.com/the-composition/automating-our-development-flow-with-atomist-6b0ec73348b6#.hwa55uv8o).

## Rugs

### TravisBuildRug

Build and publish a Rug project using the central build service.

#### Running

Typically you would run with the Atomist bot in a channel associated
with a GitHub repo.  If you want to test locally, you need to set up
the [Rug CLI][cli] and configure secrets in your CLI configuration
file.

[cli]: https://github.com/atomist/rug-cli

```yaml
configuration:
  secrets:
    github://user_token?scopes=repo: "GitHub Personal Access Token with repo scope"
    secret://team?path=maven_base_url: "URL to a Maven repo without repo name"
    secret://team?path=maven_user: "Maven user with write access"
    secret://team?path=maven_token: "API token for Maven user"
    secret://team?path=travis_token: "Atomist Travis Access Token"
```

Once you have the CLI configured with the needed secrets, you can run
this Rug with the following command.

```
$ slack_team=SLACK_TEAM_ID
$ rug command -urX -l --team-id=$slack_team TravisBuildRug owner=github-user-or-org repo=repo-name version=1.2.3 teamId=$slack_team
```

## Support

General support questions should be discussed in the `#support`
channel on our community Slack team
at [atomist-community.slack.com][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/travis-handlers/issues

## Developing

A very clean build and test:

```
$ find .atomist/{handlers,tests} -name '*.js' -print0 | xargs -0 rm && ( cd .atomist && \rm -rf node_modules && npm install ) && rug clean && rug test -urX
```

---
Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://www.atomist.com/
[slack]: https://join.atomist.com/
