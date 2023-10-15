# ⬆️📈 Upptime Uptime Monitor

This repository contains Upptime's GitHub Action's source code.

[**To get started, visit upptime/upptime →**](https://github.com/upptime/upptime)

[![Build CI](https://github.com/upptime/uptime-monitor/workflows/Build%20CI/badge.svg)](https://github.com/upptime/uptime-monitor/actions?query=workflow%3A%22Build+CI%22)
[![Release CI](https://github.com/upptime/uptime-monitor/workflows/Release%20CI/badge.svg)](https://github.com/upptime/uptime-monitor/actions?query=workflow%3A%22Release+CI%22)

## 🎁 Contributing

This repository is for Upptime's GitHub Action. We love contributions, so please read our [Contributing Guidelines](https://github.com/upptime/.github/blob/main/CONTRIBUTING.md) and [Code of Conduct](https://github.com/upptime/.github/blob/main/CODE_OF_CONDUCT.md) and open an issue or make a pull request!

### Issues

We use the [upptime/upptime](https://github.com/upptime/upptime) repository for issues for all projects, including this one. If you found a bug or have a feature request, [open an issue](https://github.com/upptime/upptime/issues) in the Upptime repository and add the label "action".

## 💻 Usage

When you use Upptime, we automatically add the required workflows. If you want to manually use this package, you can use `npx`:

Generate the `README.md` summary file:

```bash
npx @upptime/uptime-monitor summary
```

Make network requests to get the response time and commit them to git history:

```bash
npx @upptime/uptime-monitor response-time
```

Generate the static status website, powered by [upptime/status-page](https://github.com/upptime/status-page):

```bash
npx @upptime/uptime-monitor site
```

Generate response time graphs, powered by [upptime/graphs](https://github.com/upptime/graphs):

```bash
npx @upptime/uptime-monitor graphs
```

Check uptime, but don't make git commits with network requests:

```bash
npx @upptime/uptime-monitor
```

## 📄 License

[MIT](./LICENSE) © [Pabio](https://pabio.com)

<p align="center">
  <a href="https://koj.co">
    <img width="44" alt="Koj" src="https://kojcdn.com/v1598284251/website-v2/koj-github-footer_m089ze.svg">
  </a>
</p>
<p align="center">
  <sub>An open source project by <a href="https://koj.co">Koj</a>. <br> <a href="https://koj.co">Furnish your home in style, for as low as CHF175/month →</a></sub>
</p>
