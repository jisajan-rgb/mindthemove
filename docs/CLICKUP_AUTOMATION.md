# ClickUp API Starter (MindTheMove)

## 1) Add secrets to `.env.local`

```bash
CLICKUP_TOKEN=
CLICKUP_TEAM_ID=
CLICKUP_SPACE_ID=
CLICKUP_LIST_ID=
CLICKUP_DEFAULT_ASSIGNEE_ID=
```

> `CLICKUP_TEAM_ID` and `CLICKUP_SPACE_ID` are optional for starter commands, but useful for structured workflows.

## 2) Test token

```bash
node --env-file=.env.local scripts/clickup-starter.mjs health
```

## 3) Discover IDs (team/space/folder/list)

```bash
node --env-file=.env.local scripts/clickup-starter.mjs discover
```

## 4) Create a task

```bash
node --env-file=.env.local scripts/clickup-starter.mjs create-task "Follow up with solicitor partners" "Call top 5 this morning"
```

## 5) Run daily planning template task

```bash
node --env-file=.env.local scripts/clickup-starter.mjs morning-planning
```

## 6) Optional: schedule via OpenClaw cron

Use a daily cron job to run the `morning-planning` command and send summary back to Telegram/Discord.
