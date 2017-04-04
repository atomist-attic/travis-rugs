import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers';
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression';
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators';

import { Build } from '@atomist/cortex/Build';
import { Tag } from '@atomist/cortex/Tag';

@EventHandler("TravisBuilds", "Handle build events",
    new PathExpression<Build, Build>(
        `/Build
            [@platform='travis']
            [/hasBuild::Commit()[/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/isTagged::Tag()]?]
                [/on::Repo()/channel::ChatChannel()]
            [/triggeredBy::Push()
                [/contains::Commit()/author::GitHubId()
                    [/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/on::Repo()]]`))
@Tags("ci", "travis")
class Built implements HandleEvent<Build, Build> {
    handle(event: Match<Build, Build>): Plan {
        let build = event.root()
        let plan = new Plan()

        let message = new Message()
        message.withNode(build)

        let repo = build.on().name()
        let owner = build.on().owner()
        let cid = "commit_event/" + build.on().owner() + "/" + repo + "/" + build.ofCommit().sha()
        message.withCorrelationId(cid)

        // TODO split this into two handlers with proper tree expressions with predicates
        if (build.status() == "Passed" || build.status() == "Fixed") {
            try {
                if (build.status() == "Fixed" && build.ofCommit().author() != null && build.ofCommit().author().of() != null) {
                    let dmMessage = new Message()
                    dmMessage.body = `Travis CI build \`#${build.name()}\` of \`${owner}/${repo}\` is now fixed`
                    dmMessage.channelId = build.ofCommit().author().of().hasChatIdentity().id()
                    plan.add(dmMessage)
                }
            }
            catch (e) {
                console.log((<Error>e).message)
            }
            // TODO cd this is impossible to write; there seems to be a bug in Cortex/Rug where this is expected to be
            // wrapped in a Tag[]
            try {
                let tag = build.ofCommit().isTagged() as any
                if (tag) {
                    message.addAction({
                        label: 'Release',
                        instruction: {
                            kind: "command",
                            name: { group: "atomist-rugs", artifact: "github-handlers", name: "CreateGitHubRelease" },
                            parameters: {
                                owner: build.on().owner(),
                                repo: build.on().name(),
                                tag: tag.name(),
                                message: "Release created by TravisBuilds"
                            }
                        }
                    })
                }
            }
            catch (e) {
                console.log((<Error>e).message)
            }
        }
        else if (build.status() == "Failed" || build.status() == "Broken" || build.status() == "Still Failing") {
            try {
                if (build.ofCommit().author() != null && build.ofCommit().author().of() != null) {
                    let dmMessage = new Message()
                    let commit = "`" + build.ofCommit().sha() + "`"
                    dmMessage.body = `Travis CI build \`#${build.name()}\` of \`${owner}/${repo}\` failed after your last commit ${commit}: ${build.buildUrl()}`
                    dmMessage.channelId = build.ofCommit().author().of().hasChatIdentity().id()
                    plan.add(dmMessage)
                }
            }
            catch (e) {
                console.log((<Error>e).message)
            }
            message.addAction({
                label: 'Restart',
                instruction: {
                    kind: "command",
                    name: "RestartTravisBuild",
                    parameters: {
                        buildId: build.id(),
                        org: build.on().owner()
                    }
                }
            })
        }
        plan.add(message)
        return plan
    }
}
export const built = new Built()


@EventHandler("TravisBuildsPrs", "Handle build events from pull-requests",
    new PathExpression<Build, Build>(
        `/Build
            [@platform='travis']
            [/on::Repo()/channel::ChatChannel()]
            [/triggeredBy::PullRequest()
                [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/on::Repo()]]`))
@Tags("ci", "travis")
class PRBuild implements HandleEvent<Build, Build> {
    handle(event: Match<Build, Build>): Plan {
        let build = event.root() as any

        let message = new Message()
        message.withNode(build)

        let cid = "commit_event/" + build.on().owner() + "/" + build.on().name() + "/" + build.triggeredBy().contains().sha()
        message.withCorrelationId(cid)

        // TODO split this into two handlers with proper tree expressions with predicates
        if (build.status() == "Passed" || build.status() == "Fixed") {
            message.addAction({
                label: 'Release',
                instruction: {
                    kind: "command",
                    name: { group: "atomist-rugs", artifact: "github-handlers", name: "CreateGitHubRelease" },
                    parameters: {
                        owner: build.on().owner(),
                        repo: build.on().name()
                    }
                }
            })
        }
        else if (build.status() == "Failed" || build.status() == "Broken" || build.status() == "Still Failing") {
            message.addAction({
                label: 'Restart',
                instruction: {
                    kind: "command",
                    name: "RestartTravisBuild",
                    parameters: {
                        buildId: build.id(),
                        org: build.on().owner()
                    }
                }
            })
        }

        return Plan.ofMessage(message);
    }
}

export const prBuilt = new PRBuild();
