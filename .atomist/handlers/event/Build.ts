import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'

import { Build } from '@atomist/cortex/Build'

@EventHandler("TravisBuilds", "Handle build events",
    new PathExpression<Build, Build>(
        `/Build
            [@platform='travis']
            [/hasBuild::Commit()
                [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
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
        let cid = "commit_event/" + build.on().owner() + "/" + repo + "/" + build.ofCommit().sha()
        message.withCorrelationId(cid)

        // TODO split this into two handlers with proper tree expressions with predicates
        if (build.status() == "Passed" || build.status() == "Fixed") {
            console.log(JSON.stringify(build.ofCommit().author().of().hasChatIdentity().id()))
            if (build.status() == "Fixed") {
                if (build.ofCommit().author() != null && build.ofCommit().author().of() != null) {
                    let dmMessage = new Message()
                    dmMessage.body = `Travis CI build ${build.name()} of repo ${repo} is now fixed`
                    dmMessage.channelId = build.ofCommit().author().of().hasChatIdentity().id()
                    plan.add(dmMessage)
                }
            }
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
            if (build.ofCommit().author() != null && build.ofCommit().author().of() != null) {
                let dmMessage = new Message()
                let commit = "`" + build.ofCommit().sha() + "`"
                dmMessage.body = `Travis CI build ${build.name()} of repo ${repo} failed after your last commit ${commit}: ${build.buildUrl()}`
                dmMessage.channelId = build.ofCommit().author().of().hasChatIdentity().id()
                plan.add(dmMessage)
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
            [/on::Repo()/channel::ChatChannel()]
            [/triggeredBy::PullRequest()
                [/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/contains::Commit()/author::GitHubId()[/hasGithubIdentity::Person()/hasChatIdentity::ChatId()]?]
                [/on::Repo()]]`))
@Tags("ci", "travis")
class PRBuild implements HandleEvent<Build, Build> {
    handle(event: Match<Build, Build>): Message {
        let build = event.root() as any

        let message = new Message()
        message.withNode(build)

        let cid = "commit_event/" + build.on().owner() + "/" + build.on().name() + "/" + build.triggerdBy().contains().sha()
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

        return message
    }
}
export const prBuilt = new PRBuild()
