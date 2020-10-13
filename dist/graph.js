"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGraphs = void 0;
const rest_1 = require("@octokit/rest");
const slugify_1 = __importDefault(require("@sindresorhus/slugify"));
const fs_extra_1 = require("fs-extra");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const chartjs_node_canvas_1 = require("chartjs-node-canvas");
const canvasRenderService = new chartjs_node_canvas_1.CanvasRenderService(600, 400);
exports.generateGraphs = async () => {
    const config = js_yaml_1.safeLoad(await fs_extra_1.readFile(path_1.join(".", ".upptimerc.yml"), "utf8"));
    const owner = config.owner;
    const repo = config.repo;
    const octokit = new rest_1.Octokit({
        auth: config.PAT || process.env.GH_PAT || process.env.GITHUB_TOKEN,
        userAgent: config.userAgent || process.env.USER_AGENT || "KojBot",
    });
    await fs_extra_1.ensureDir(path_1.join(".", "graphs"));
    for await (const site of config.sites) {
        const slug = slugify_1.default(site.name);
        let uptime = 0;
        let responseTime = 0;
        try {
            const api = await fs_extra_1.readJson(path_1.join(".", "history", "summary.json"));
            const item = api.find((site) => site.slug === slug);
            if (item) {
                uptime = parseFloat(item.uptime);
                responseTime = item.time;
            }
        }
        catch (error) { }
        await fs_extra_1.ensureDir(path_1.join(".", "api", slug));
        await fs_extra_1.writeJson(path_1.join(".", "api", slug, "uptime.json"), {
            schemaVersion: 1,
            label: "uptime",
            message: `${uptime}%`,
            color: uptime > 95
                ? "brightgreen"
                : uptime > 90
                    ? "green"
                    : uptime > 85
                        ? "yellowgreen"
                        : uptime > 80
                            ? "yellow"
                            : uptime > 75
                                ? "orange"
                                : "red",
        });
        await fs_extra_1.writeJson(path_1.join(".", "api", slug, "response-time.json"), {
            schemaVersion: 1,
            label: "response time",
            message: `${responseTime} ms`,
            color: responseTime < 200
                ? "brightgreen"
                : responseTime < 400
                    ? "green"
                    : responseTime < 600
                        ? "yellowgreen"
                        : responseTime < 800
                            ? "yellow"
                            : responseTime < 1000
                                ? "orange"
                                : "red",
        });
        const history = await octokit.repos.listCommits({
            owner,
            repo,
            path: `history/${slug}.yml`,
            per_page: 10,
        });
        if (!history.data.length)
            continue;
        const data = history.data
            .filter((item) => item.commit.message.includes(" in ") &&
            Number(item.commit.message.split(" in ")[1].split("ms")[0]) !== 0)
            .map((item) => [
            Number(item.commit.message.split(" in ")[1].split("ms")[0]),
            String(item.commit.author.date),
        ]);
        const image = await canvasRenderService.renderToBuffer({
            type: "line",
            data: {
                labels: [1, ...data.map((item) => item[1])],
                datasets: [
                    {
                        backgroundColor: "#89e0cf",
                        borderColor: "#1abc9c",
                        data: [1, ...data.map((item) => item[0])],
                    },
                ],
            },
            options: {
                legend: { display: false },
                scales: {
                    xAxes: [
                        {
                            display: false,
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                    yAxes: [
                        {
                            display: false,
                            gridLines: {
                                display: false,
                            },
                        },
                    ],
                },
            },
        });
        await fs_extra_1.writeFile(path_1.join(".", "graphs", `${slug}.png`), image);
    }
};
