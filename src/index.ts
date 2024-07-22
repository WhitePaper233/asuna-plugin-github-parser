import { Context, h, Schema } from 'koishi'

export const name = 'github-parser'

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

const GITHUB_REPO_REGEX = /https:\/\/github\.com\/([^/]+)\/([^/]+)\/?/

class GithubParser {
    constructor(ctx: Context) {
        ctx.intersect(session => GITHUB_REPO_REGEX.test(session.content))
            .middleware(async (session, next) => {
                // match repo owner and name
                const match = session.content.match(GITHUB_REPO_REGEX)
                if (!match) return next()
                const [, owner, repo] = match

                try {
                    // check repo existance
                    await ctx.http.get(`https://github.com/${owner}/${repo}`)
                    // send repo info
                    session.send(h('img', { src: `https://opengraph.githubassets.com/0/${owner}/${repo}` }))
                }
                catch (e) {
                    return next()
                }

                return next()
            })
    }
}

export function apply(ctx: Context) {
    ctx.plugin(GithubParser)
}
