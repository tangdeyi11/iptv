addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request, env));
});

async function handleRequest(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // ✅ 安全欢迎页（不暴露任何路径）
  if (pathname === "/") {
    return new Response(`
      <html>
        <head><title>IPTV Worker</title></head>
        <body>
          <h1>欢迎</h1>
          <p>此服务正在运行。</p>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html;charset=utf-8" }
    });
  }

  // ✅ 隐藏设置入口：你自己知道这个路径
  if (pathname === "/tangdeyi11") {
    const iptv = url.searchParams.get("iptv");
    const iptvdl = url.searchParams.get("iptvdl");
    const clear = url.searchParams.get("clear");

    // 清除设置
    if (clear === "true") {
      await env.REPLACE_KV.delete("iptv");
      await env.REPLACE_KV.delete("iptvdl");
    }

    // 设置参数
    if (iptv !== null && iptv !== "") {
      await env.REPLACE_KV.put("iptv", iptv);
    }
    if (iptvdl !== null && iptvdl !== "") {
      await env.REPLACE_KV.put("iptvdl", iptvdl);
    }

    const savedIptv = await env.REPLACE_KV.get("iptv") || "";
    const savedIptvdl = await env.REPLACE_KV.get("iptvdl") || "";

    const message = (iptv || iptvdl || clear === "true") ? `<p style="color:green;">设置已更新！</p>` : "";

    return new Response(`
      <html>
        <head><meta charset="utf-8"><title>设置 IPTV</title></head>
        <body>
          <h2>设置 IPTV 替换值</h2>
          ${message}
          <form method="GET" action="/tangdeyi11">
            <label>iptv：</label><br/>
            <input type="text" name="iptv" value="${savedIptv}" /><br/><br/>
            <label>iptvdl：</label><br/>
            <input type="text" name="iptvdl" value="${savedIptvdl}" /><br/><br/>
            <input type="submit" value="提交" />
          </form>
          <br/>
          <form method="GET" action="/tangdeyi11">
            <input type="hidden" name="clear" value="true"/>
            <input type="submit" value="清除设置" style="color:red;" />
          </form>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html;charset=utf-8" }
    });
  }

  // ✅ 处理 .m3u 请求
  if (pathname.endsWith(".m3u")) {
    const filename = pathname.slice(1); // 去掉前导斜杠
    const targetUrl = `https://git.dtcs.dpdns.org/${filename}`;

    const response = await fetch(targetUrl);
    if (!response.ok) {
      return new Response("远程内容获取失败", { status: 404 });
    }

    let content = await response.text();

    // 从 KV 获取设置的值
    const iptv = await env.REPLACE_KV.get("iptv");
    const iptvdl = await env.REPLACE_KV.get("iptvdl");

    // 替换逻辑：根据访问路径判断使用哪个值
    if (pathname === "/iptv.m3u" && iptv) {
      content = content.replace(/ipaddress/g, iptv);
    } else if (pathname === "/iptvdl.m3u" && iptvdl) {
      content = content.replace(/ipaddress/g, iptvdl);
    }

    return new Response(content, {
      headers: { "Content-Type": "text/plain" }
    });
  }

  // 默认返回 404
  return new Response("未定义的路径", { status: 404 });
}
