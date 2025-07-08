//#region generated meta
type Inputs = {
  owner: string;
  repo: string;
  githubToken: string;
  saveAs: string;
  continue: boolean;
};
type Outputs = {
  output: string;
};
//#endregion

import type { Context } from "@oomol/types/oocana";
import * as https from "node:https";
import { appendFile, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const GQL = `
query ($OWNER: String!, $REPO: String!, $AFTER: String) {
  repository(owner: $OWNER, name: $REPO) {
    stargazers(first: 100, after: $AFTER) {
      totalCount,
      pageInfo {
        hasNextPage,
        endCursor
      },
      nodes {
        name,
        login,
        email
      }
    }
  }
}`;

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {
    await execute(params, context);
    
    return {
        output: params.saveAs,
    }
};

async function execute(params: Inputs, context: Context<Inputs, Outputs>) {
    const prevPath = path.join(context.tmpPkgDir, `${params.owner}-${params.repo}-prev.json`);

    if (!params.continue) {
        await rm(prevPath, {
            force: true,
        });
    }

    await stat(prevPath)
        .catch(() => {
            return rm(params.saveAs, {
                force: true,
            });
        });

    const prev = await (readFile(prevPath, "utf8").then(data => JSON.parse(data)).catch(() => ({
        count: 0,
        after: undefined,
    })));

    let count = prev.count;
    let after = prev.after;
    let hasNextPage = true;
    while (hasNextPage) {
        let res: any
        try {
            res = await post({
                query: GQL,
                variables: {
                    OWNER: params.owner,
                    REPO: params.repo,
                    AFTER: after,
                },
            }, {
                "Authorization": `Bearer ${params.githubToken}`
            });

            if (res.data.errors) {
                throw new Error(res.data.errors[0].message);
            }
        } catch (err) {
            if (err.code === 'ECONNRESET') {
                continue;
            }

            if (err.message?.includes("rate limit")) {
                throw new Error(`The GitHub token has reached its usage limit. Please wait ${Number(res.header['x-ratelimit-reset']) - Math.ceil(Date.now() / 1000)} seconds before trying again or switch to a different GitHub token.`);
            }

            console.error(err);
            throw err;
        }

        const { pageInfo, nodes, totalCount } = res.data.data.repository.stargazers;

        if (nodes.length === 0) {
            break;
        }

        count += nodes.length;

        context.reportProgress((count / totalCount) * 100);

        const data = nodes.filter(node => node.email !== "").map(node => {
            return JSON.stringify({
                name: node.name || node.login,
                email: node.email,
            })
        });

        if (data.length !== 0) {
            await appendFile(params.saveAs, `${data.join("\n")}\n`, "utf8");
        }

        after = pageInfo.endCursor;
        hasNextPage = pageInfo.hasNextPage;

        if (after) {
            await writeFile(prevPath, JSON.stringify({
                count,
                after,
            }), "utf8");
        }
    }

    context.reportProgress(100);
    await rm(prevPath, {
        force: true,
    });
}

function post(body: any, headers: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'api.github.com',
            port: 443,
            path: '/graphql',
            method: 'POST',
            headers: {
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "user-agent": "OOMOL Studio",
                ...headers,
            },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        }, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                if (res.statusCode >= 400) {
                    console.error("status code:", res.statusCode);
                    return reject(new Error(`Request failed with status code ${res.statusCode}, message: ${body}`));
                }

                return resolve({
                    data: JSON.parse(data),
                    header: res.headers,
                });
            });
        });

        req.on("error", (err) => {
            reject(err);
        });

        req.write(JSON.stringify(body));
        req.end();
    })
}
