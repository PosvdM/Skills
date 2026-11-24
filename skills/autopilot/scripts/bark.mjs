#!/usr/bin/env node
// 发送 Bark 通知，或在后台监视 autopilot 报告。需要 Node 18 及以上（内置 fetch）。
//
// 用法：
//   node bark.mjs send <Bark 地址> <标题> <正文>
//   node bark.mjs watch <Bark 地址> <报告路径> [超时分钟=90] [最长小时=24]
//
// watch 每 5 分钟检查一次报告：第一行状态不是“进行中”时退出；报告超过超时分钟没有修改时
// 发一条通知，报告再次修改并又超时才会再发。macOS 上同时运行 caffeinate，阻止系统在
// watch 退出前进入睡眠。

import { spawn } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { basename } from "node:path";

const GROUP = "Auto Pilot";
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

async function send(url, title, body) {
  const res = await fetch(url.replace(/\/+$/, ""), {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ title, body, group: GROUP }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Bark 返回 HTTP ${res.status}：${text}`);
  return text;
}

function readStatus(report) {
  const firstLine = readFileSync(report, "utf8").split(/\r?\n/, 1)[0];
  const m = firstLine.match(/^状态[：:]\s*(\S+)/);
  return m ? m[1] : null;
}

async function watch(url, report, staleMin, maxHours) {
  statSync(report); // 报告不存在时直接报错退出
  if (process.platform === "darwin") {
    spawn("caffeinate", ["-i", "-w", String(process.pid)], { stdio: "ignore" }).unref();
  }
  const deadline = Date.now() + maxHours * 3600 * 1000;
  let alertedMtime = 0;
  for (;;) {
    let status = null;
    let mtime = 0;
    try {
      status = readStatus(report);
      mtime = statSync(report).mtimeMs;
    } catch (err) {
      console.error(`读取报告失败：${err.message}`);
    }
    if (status && status !== "进行中") {
      console.log(`报告状态为“${status}”，看门狗退出`);
      return;
    }
    const idleMin = (Date.now() - mtime) / 60000;
    if (idleMin > staleMin && mtime !== alertedMtime) {
      alertedMtime = mtime;
      const body = `报告 ${basename(report)} 已 ${Math.round(idleMin)} 分钟没有更新，Agent 可能卡住或额度用完。报告位置：${report}`;
      try {
        await send(url, "[可能停了] AutoPilot", body);
        console.log(`已发送通知：${body}`);
      } catch (err) {
        console.error(err.message);
      }
    }
    if (Date.now() >= deadline) {
      console.log(`已运行 ${maxHours} 小时，看门狗退出`);
      return;
    }
    await new Promise((r) => setTimeout(r, CHECK_INTERVAL_MS));
  }
}

const [cmd, url, ...rest] = process.argv.slice(2);
const usage = "用法：node bark.mjs send <Bark 地址> <标题> <正文> | watch <Bark 地址> <报告路径> [超时分钟] [最长小时]";
try {
  if (cmd === "send" && url && rest.length >= 2) {
    console.log(await send(url, rest[0], rest.slice(1).join(" ")));
  } else if (cmd === "watch" && url && rest[0]) {
    await watch(url, rest[0], Number(rest[1] ?? 90), Number(rest[2] ?? 24));
  } else {
    console.error(usage);
    process.exit(2);
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
