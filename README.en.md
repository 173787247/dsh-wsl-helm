# dsh-wsl-helm

> **Languages:** [中文（首页）](./README.md) · **English** (this file)

Read-only helm list/status/history.

| | |
|---|---|
| Version | **0.1.0** |
| Kit | Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit); not in `install.sh` |

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-helm
```

Batch link (optional): `bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## Tools

| Tool | Role |
|------|------|
| `helm_status_tool` | helm version |
| `helm_list` | list releases |
| `helm_release_status` | release status |
| `helm_history` | history |

## Config

`allowedContexts / maxOutputChars / timeoutMs`

No install/upgrade/uninstall. Optional `allowedContexts`.

## License

MIT
