// 监听 fetch 请求事件，所有请求都会触发 handleRequest 函数
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event));
});

// 主处理函数
async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url); // 解析 URL
  const pathname = url.pathname;    // 获取路径

  const kv = REPLACE_KV; // 引用绑定的 KV 命名空间（已在控制台中绑定）

  // === 路由处理开始 ===

  // 根目录 "/"：返回欢迎页面（不暴露设置路径）
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

  // 私密配置页 "/隐藏路径"：用于设置或清除 KV 中的替换值
  if (pathname === "/隐藏路径") {
    // 获取 URL 查询参数
    const iptv = url.searchParams.get("iptv");
    const iptvdl = url.searchParams.get("iptvdl");
    const clear = url.searchParams.get("clear");

    // === 清除设置 ===
    if (clear === "true") {
      await kv.delete("iptv");
      await kv.delete("iptvdl");
    }

    // === 保存设置 ===
    if (iptv !== null && iptv !== "") {
      await kv.put("iptv", iptv); // 保存 iptv 替换值
    }
    if (iptvdl !== null && iptvdl !== "") {
      await kv.put("iptvdl", iptvdl); // 保存 iptvdl 替换值
    }

    // 读取已保存的值，用于表单展示
    const savedIptv = await kv.get("iptv") || "";
    const savedIptvdl = await kv.get("iptvdl") || "";

    const message = (iptv || iptvdl || clear === "true")
      ? `<p style="color:green;">设置已更新！</p>` : "";

    // 返回设置表单页面
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

  // 处理 .m3u 文件路径，例如 /iptv.m3u 或 /iptvdl.m3u
  if (pathname.endsWith(".m3u")) {
    // 从路径中提取文件名（去掉开头的斜杠）
    const filename = pathname.slice(1);
    const targetUrl = `https://git.dtcs.dpdns.org/${filename}`; // 构造远程资源 URL

    // 获取远程内容
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return new Response("远程内容获取失败", { status: 404 });
    }

    // 读取文本内容
    let content = await response.text();

    // 从 KV 获取替换用的值
    const iptv = await kv.get("iptv");
    const iptvdl = await kv.get("iptvdl");

    // 根据访问路径决定使用哪个值进行替换
    if (pathname === "/iptv.m3u" && iptv) {
      content = content.replace(/ipaddress/g, iptv);
    } else if (pathname === "/iptvdl.m3u" && iptvdl) {
      content = content.replace(/ipaddress/g, iptvdl);
    }

    // 返回修改后的内容
    return new Response(content, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  // 所有其他路径返回 404
  return new Response("未定义的路径", { status: 404 });
}
