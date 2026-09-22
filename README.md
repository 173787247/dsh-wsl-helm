# dsh-wsl-helm

> **语言：** **中文**（本页） · [English](./README.en.md)

Helm 只读：list / status / history。

| | |
|---|---|
| 版本 | **0.1.0** |
| 套件 | [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit) **可选**，不在 `install.sh` |

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-helm
# 或本机 path：
# dsh plugin --profile web add /mnt/c/Users/YOU/Desktop/AIFullStackDevelopment/dsh-wsl-helm
```

kit 批量链接（可选）：`bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## 工具

| 工具 | 作用 |
|------|------|
| `helm_status_tool` | helm 版本 |
| `helm_list` | release 列表 |
| `helm_release_status` | release 状态 |
| `helm_history` | 历史 |

## 配置要点

`allowedContexts / maxOutputChars / timeoutMs`

禁止 install/upgrade/uninstall。可配 `allowedContexts`。

## License

MIT
