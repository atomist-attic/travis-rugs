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

## Contributing

If you are interested in contributing to the Atomist open source
projects, please see our [contributing guidelines][contrib] and
our [code of conduct][code].

[contrib]: https://github.com/atomist/welcome/blob/master/CONTRIBUTING.md
[code]: https://github.com/atomist/welcome/blob/master/CODE_OF_CONDUCT.md

## Developing

You can build, test, and install the project locally with
the [Rug CLI][cli].

[cli]: https://github.com/atomist/rug-cli

```
$ rug test
$ rug install
```

To clean up cached files and update TypeScript dependencies, run this
command.

```
$ ( cd .atomist && find editors generators handlers tests -name '*.js' -print0 | xargs -0 rm; rm -rf node_modules; yarn && rug clean )
```

To create a new release of the project, simply push a tag of the form
`M.N.P` where `M`, `N`, and `P` are integers that form the next
appropriate [semantic version][semver] for release.  For example:

[semver]: http://semver.org

```
$ git tag -a 1.2.3
```

The Travis CI build (see badge at the top of this page) will upload
the needed artifacts.

---
Created by [Atomist][atomist].
Need Help?  [Join our Slack team][slack].

[atomist]: https://www.atomist.com/
[slack]: https://join.atomist.com/
