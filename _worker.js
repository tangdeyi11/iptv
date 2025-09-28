addEventListener("fetch", event => {
  event.respondWith(handleRequest(event));
});

function jsStringEscape(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const kv = IPTV_KV; // 替换为你的 KV 绑定名

  if (pathname === "/") {
    return new Response(`
      <html><head><title>IPTV Worker</title></head><body>
      <h1>欢迎</h1><p>此服务正在运行。</p></body></html>
    `, { headers: { "Content-Type": "text/html;charset=utf-8" } });
  }

  // IPTV 设置页面
  if (pathname === "/tangdeyi11") {
    const iptv = url.searchParams.get("iptv");
    const iptvdl = url.searchParams.get("iptvdl");
    const clear = url.searchParams.get("clear");

    if (clear === "true") {
      await kv.delete("iptv");
      await kv.delete("iptvdl");
    }

    if (iptv) await kv.put("iptv", iptv);
    if (iptvdl) await kv.put("iptvdl", iptvdl);

    const savedIptv = await kv.get("iptv") || "";
    const savedIptvdl = await kv.get("iptvdl") || "";
    const message = (iptv || iptvdl || clear === "true")
      ? `<p style="color:green;">设置已更新！</p>` : "";

    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>设置 IPTV</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            max-width: 720px;
            margin: 16px auto;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
              Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            padding: 0 12px;
            background: #fafafa;
            color: #333;
          }
          h2, h3, h4 {
            text-align: center;
          }
          form {
            margin-bottom: 20px;
          }
          label {
            font-weight: bold;
          }
          input[type="text"] {
            width: 100%;
            padding: 8px 10px;
            font-size: 16px;
            margin-top: 4px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
          }
          input[type="submit"] {
            cursor: pointer;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 4px;
            border: none;
            background-color: #0078d7;
            color: white;
            transition: background-color 0.3s ease;
          }
          input[type="submit"]:hover {
            background-color: #005ea3;
          }
          input[type="submit"][style*="color:red"] {
            background-color: #d9534f;
            color: white;
          }
          input[type="submit"][style*="color:red"]:hover {
            background-color: #b52b27;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 14px; 
            margin-top: 16px;
          }
          th, td { 
            border: 1px solid #ccc; 
            padding: 8px 10px; 
            text-align: left;
            word-break: break-word;
          }
          th { 
            background-color: #f5f5f5;
          }
          tr:nth-child(even) { 
            background-color: #fafafa;
          }
          tr:hover { 
            background-color: #f0f8ff;
          }
          #resultArea {
            margin-top: 16px;
            font-size: 14px;
            word-break: break-word;
          }
          /* 按钮组自适应样式 */
          .button-group {
            display: flex;
            justify-content: center;
            gap: 16px; /* 按钮间距 */
            flex-wrap: wrap;
            margin-bottom: 16px;
          }
          .button-group button {
            flex: 1 1 180px; /* 基础宽度180px，可伸缩 */
            max-width: 220px;
            padding: 10px 16px;
            font-size: 16px;
            border: none;
            border-radius: 4px;
            background-color: #0078d7;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          .button-group button:hover {
            background-color: #005ea3;
          }
          @media (max-width: 600px) {
            .button-group {
              flex-direction: column;
              gap: 12px;
            }
            .button-group button {
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <h2>设置 IPTV 替换值</h2>
        ${message}
        <form method="GET" action="/tangdeyi11">
          <label>iptv：</label><br/>
          <input type="text" name="iptv" value="${savedIptv}" autocomplete="off" /><br/><br/>
          <label>iptvdl：</label><br/>
          <input type="text" name="iptvdl" value="${savedIptvdl}" autocomplete="off" /><br/><br/>
          <input type="submit" value="提交设置" />
        </form>
        <form method="GET" action="/tangdeyi11">
          <input type="hidden" name="clear" value="true"/>
          <input type="submit" value="清除设置" style="background-color:#d9534f; color: white;" />
        </form>
        <hr>
        <h3>IPTV 在线列表检索</h3>
        <style>
        .btn-group {
          text-align: center;
          margin: 20px 0;
        }
      
        .btn-group button {
          padding: 6px 14px;
          font-size: 14px;
          line-height: 1;
          height: 32px;
          border-radius: 4px;
          border: 1px solid #007bff;
          background-color: #007bff;
          color: white;
          cursor: pointer;
          margin: 0 5px;
          display: inline-block;
          vertical-align: middle;
          box-sizing: border-box;
          transition: background-color 0.3s ease;
        }
      
        .btn-group button:hover {
          background-color: #0056b3;
        }
      
        @media screen and (max-width: 480px) {
          .btn-group button {
            padding: 5px 12px;
            height: 30px;
            font-size: 13px;
          }
        }
      </style>
      
      <div class="btn-group">
        <button onclick="fetchList('iptv')">iptv列表检索</button>
        <button onclick="fetchList('iptvdl')">iptvdl列表检索</button>
      </div>      
      <div id="resultArea"></div>

        <script>
          async function fetchList(type) {
            const urls = {
              iptv: '/list/iptv',
              iptvdl: '/list/iptvdl'
            };
            const jsonUrls = {
              iptv: '/proxy/testjson?type=iptv',
              iptvdl: '/proxy/testjson?type=iptvdl'
            };

            const resultArea = document.getElementById('resultArea');
            resultArea.innerHTML = '<p>正在加载，请稍候...</p>';

            try {
              const resText = await fetch(urls[type]).then(r => r.text());
              resultArea.innerHTML = resText;

              const json = await fetch(jsonUrls[type]).then(r => r.json());
              renderTestTable(json, resultArea);
            } catch (err) {
              resultArea.innerHTML = '<p>请求失败。</p>';
            }
          }

          function renderTestTable(data, container) {
            if (!Array.isArray(data) || data.length === 0) {
              container.innerHTML += '<p>⚠️ 无测试数据</p>';
              return;
            }
            let html = \`
              <h4>IPTV 测试结果列表</h4>
              <table>
              <thead><tr>
                <th>URL</th><th>连接结果</th><th>数据持续时间</th><th>测试时间</th><th>状态</th>
              </tr></thead><tbody>\`;

            for (const item of data) {
              let color = "black", icon = "";
              const r = item.Result;
              if (r.includes("OK")) { color = "green"; icon = "✅"; }
              else if (r.includes("Blocked")) { color = "orange"; icon = "⚠️"; }
              else if (r.includes("Error")) { color = "red"; icon = "❌"; }

              html += \`
                <tr>
                  <td><a href="\${item.URL}" target="_blank">\${item.URL}</a></td>
                  <td>\${item.Result}</td>
                  <td>\${item.LastDataTimeSeconds}</td>
                  <td>\${item.TestTime}</td>
                  <td style="color:\${color}">\${icon}</td>
                </tr>\`;
            }
            html += '</tbody></table>';
            container.innerHTML += html;
          }

          function fillInput(type, value) {
            const input = document.querySelector(\`input[name="\${type}"]\`);
            if (input) input.value = value;
          }
        </script>
      </body>
      </html>
    `, { headers: { "Content-Type": "text/html;charset=utf-8" } });
  }

  // /proxy/testjson 代理 GitHub JSON 请求
  if (pathname === "/proxy/testjson") {
    const type = url.searchParams.get("type");
    if (!["iptv", "iptvdl"].includes(type)) {
      return new Response("无效类型", { status: 400 });
    }
    const githubJsonUrl = `https://raw.githubusercontent.com/tangdeyi11/udpxy-text/main/${type}-test.json`;
    try {
      const response = await fetch(githubJsonUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (WorkerBot)' }
      });
      if (!response.ok) return new Response("获取 GitHub JSON 失败", { status: 502 });
      const json = await response.text();
      return new Response(json, { headers: { "Content-Type": "application/json;charset=utf-8" } });
    } catch (e) {
      return new Response("请求失败：" + e.message, { status: 500 });
    }
  }

  // /list/* 返回 HTML，带点击填充输入框功能
  if (pathname.startsWith("/list/")) {
    const type = pathname.replace("/list/", "");
    if (!["iptv", "iptvdl"].includes(type)) {
      return new Response("无效类型", { status: 400 });
    }
    const githubUrl = `https://raw.githubusercontent.com/tangdeyi11/fofa-scrape/main/${type}.txt`;
    try {
      const response = await fetch(githubUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (WorkerBot)' }
      });
      if (!response.ok) return new Response("获取 GitHub 内容失败", { status: 502 });
      const html = await response.text();
      const matches = [...html.matchAll(/a href="http:\/\/([\d.]+:\d+)"/g)];
      const uniqueIps = Array.from(new Set(matches.map(m => m[1])));
      const outputHtml = uniqueIps.length > 0
        ? `<p>点击链接将填入对应输入框：</p>` +
          uniqueIps.map(ip => {
            const safeIp = jsStringEscape(ip);
            return `<div><a href="#" onclick="fillInput('${type}', '${safeIp}'); return false;">${ip}</a></div>`;
          }).join('')
        : "<p>未匹配到任何链接</p>";
      return new Response(outputHtml, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    } catch (err) {
      return new Response("请求失败：" + err.message, { status: 500 });
    }
  }

  // /iptvlist 和 /iptvdllist 返回纯文本 IPTV 地址列表 + 组播地址拼接
  if (pathname === "/iptvlist" || pathname === "/iptvdllist") {
    const isIptv = pathname === "/iptvlist";
    const type = isIptv ? "iptv" : "iptvdl";
    const groupAddress = isIptv ? "239.3.1.129:8008" : "232.0.0.27:8808";
    const githubUrl = `https://raw.githubusercontent.com/tangdeyi11/fofa-scrape/main/${type}.txt`;
    try {
      const response = await fetch(githubUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (WorkerBot)' }
      });
      if (!response.ok) return new Response(`获取 ${type} 列表失败`, { status: 502 });
      const text = await response.text();
      const matches = [...text.matchAll(/a href="http:\/\/([\d.]+:\d+)"/g)];
      const uniqueIps = Array.from(new Set(matches.map(m => m[1])));
      if (uniqueIps.length === 0) return new Response("⚠️ 未找到任何地址", { status: 200 });
      const listOutput = uniqueIps.map(ip => `http://${ip}/udp/${groupAddress}`).join("\n");
      return new Response(listOutput, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    } catch (e) {
      return new Response(`⚠️ 请求失败: ${e.message}`, { status: 500 });
    }
  }

  // 代理 .m3u 文件请求，替换 ipaddress
  if (pathname.endsWith(".m3u")) {
    const filename = pathname.slice(1);
    const targetUrl = `https://git.dtcs520.com/${filename}`;
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) return new Response("远程内容获取失败", { status: 404 });
      let content = await response.text();
      const iptv = await kv.get("iptv");
      const iptvdl = await kv.get("iptvdl");
      if (pathname === "/iptv.m3u" && iptv) {
        content = content.replace(/ipaddress/g, iptv);
      } else if (pathname === "/iptvdl.m3u" && iptvdl) {
        content = content.replace(/ipaddress/g, iptvdl);
      }
      return new Response(content, { headers: { "Content-Type": "text/plain;charset=utf-8" } });
    } catch (e) {
      return new Response("远程内容请求失败", { status: 500 });
    }
  }

  // 代理 .view 文件请求，替换 ipaddress
  if (pathname.endsWith(".view")) {
    const filename = pathname.slice(1);
    const targetUrl = `https://git.dtcs520.com/${filename.replace('.view', '.m3u')}`;
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) return new Response("远程内容获取失败", { status: 404 });
      let content = await response.text();
      const iptv = await kv.get("iptv");
      const iptvdl = await kv.get("iptvdl");
      if (pathname === "/iptv.view" && iptv) {
        content = content.replace(/ipaddress/g, iptv);
      } else if (pathname === "/iptvdl.view" && iptvdl) {
        content = content.replace(/ipaddress/g, iptvdl);
      }
      return new Response(content, { headers: { "Content-Type": "text/plain;charset=utf-8" } });
    } catch (e) {
      return new Response("远程内容请求失败", { status: 500 });
    }
  }

  return new Response("未定义的路径", { status: 404 });
}
