import { HandleEvent, Plan, DirectedMessage, LifecycleMessage, UserAddress } from '@atomist/rug/operations/Handlers';
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression';
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators';

import { Build } from '@atomist/cortex/Build';
import { Tag } from '@atomist/cortex/Tag';

@EventHandler("TravisBuilds", "Handle build events",
    new PathExpression<Build, Build>(
        `/Build
            [@provider='travis']
            [/commit::Commit()[/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
                [/tags::Tag()]?]
                [/repo::Repo()/channels::ChatChannel()]
            [/push::Push()
                [/commits::Commit()/author::GitHubId()
                    [/person::Person()/chatId::ChatId()]?]
                [/repo::Repo()]]`))
@Tags("ci", "travis")
class Built implements HandleEvent<Build, Build> {
    handle(event: Match<Build, Build>): Plan {
        let build = event.root()
        let plan = new Plan()

        let repo = build.repo.name
        let owner = build.repo.owner
        let cid = "commit_event/" + owner + "/" + repo + "/" + build.commit.sha
        
        let message = new LifecycleMessage(build, cid)

        // TODO split this into two handlers with proper tree expressions with predicates
        if (build.status == "passed") {
            try {
                let tag = build.commit.tags
                if (tag.length > 0) {
                    message.addAction({
                        label: 'Release',
                        instruction: {
                            kind: "command",
                            name: { group: "atomist-rugs", artifact: "github-handlers", name: "CreateGitHubRelease" },
                            parameters: {
                                owner: build.repo.owner,
                                repo: build.repo.name,
                                tag: tag[0].name,
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
        else if (build.status == "failed" || build.status == "broken") {
            try {
                if (build.commit.author != null && build.commit.author.person != null) {
                    let body = `Travis CI build \`#${build.name}\` of \`${owner}/${repo}\` failed after your last commit \`${build.commit.sha}\`: ${build.buildUrl}`
                    let address = new UserAddress(build.commit.author.person.chatId.id)
                    plan.add(new DirectedMessage(body, address))
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
                        buildId: build.id,
                        org: build.repo.owner
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
            [@provider='travis']
            [/repo::Repo()/channels::ChatChannel()]
            [/commit::Commit()]
            [/pullRequest::PullRequest()
                [/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
                [/commits::Commit()/author::GitHubId()[/person::Person()/chatId::ChatId()]?]
                [/repo::Repo()]]`))
@Tags("ci", "travis")
class PRBuild implements HandleEvent<Build, Build> {
    handle(event: Match<Build, Build>): Plan {
        let build = event.root()
    
        let cid = "commit_event/" + build.repo.owner + "/" + build.repo.name + "/" + build.commit.sha
        let message = new LifecycleMessage(build, cid)
        
        // TODO split this into two handlers with proper tree expressions with predicates
        if (build.status == "passed") {
            message.addAction({
                label: 'Release',
                instruction: {
                    kind: "command",
                    name: { group: "atomist-rugs", artifact: "github-handlers", name: "CreateGitHubRelease" },
                    parameters: {
                        owner: build.repo.owner,
                        repo: build.repo.name
                    }
                }
            })
        }
        else if (build.status == "failed" || build.status == "broken") {
            message.addAction({
                label: 'Restart',
                instruction: {
                    kind: "command",
                    name: "RestartTravisBuild",
                    parameters: {
                        buildId: build.id,
                        org: build.repo.owner
                    }
                }
            })
        }

        return Plan.ofMessage(message);
    }
}

export const prBuilt = new PRBuild();
