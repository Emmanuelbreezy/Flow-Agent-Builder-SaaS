(function () {
  var script = document.currentScript;
  var workflowId = script.getAttribute("data-workflow-id") || "default-id";
  var chatUrl =
    "https://flow-agent-one.vercel.app/workflow/embed-chat?workflowId=" +
    encodeURIComponent(workflowId);

  var btn = document.createElement("button");
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 70 56" class="nuxt-icon common-icon common-icon--icon page-bottom-bar__logo" height="30px" width="30px"><path fill="white" d="m27.377 44.368 11.027 11.53 8.597-13.663 22.813-2.48L66.132.284.214 7.447 3.895 46.92l23.482-2.552Z"></path></svg>`;
  btn.style =
    "position:fixed;bottom:24px;right:24px;z-index:99999;width:56px;height:56px;padding:0;border-radius:50%;background:#6366f1;border:none;box-shadow:0 2px 8px #0002;cursor:pointer;display:flex;align-items:center;justify-content:center;";
  btn.id = "flowai-embed-btn";
  document.body.appendChild(btn);

  // Create iframe (hidden by default)
  var iframe = document.createElement("iframe");
  iframe.src = chatUrl;
  iframe.style =
    "display:none;position:fixed;bottom:80px;right:24px;width:370px;height:570px;z-index:99999;border-radius:16px;border:none;box-shadow:0 4px 32px #0003;background:#fff;";
  iframe.id = "flowai-embed-iframe";
  document.body.appendChild(iframe);

  // Create close button
  var closeBtn = document.createElement("button");
  closeBtn.innerHTML = "&times;";
  closeBtn.style =
    "display:none;position:fixed;bottom:625px;right:21px;z-index:100000;background:#fff;color:#6366f1;border:none;font-size:28px;width:32px;height:32px;border-radius:50%;box-shadow:0 2px 8px #0002;cursor:pointer;align-items:center;justify-content:center;line-height:1;";
  closeBtn.id = "flowai-embed-close-btn";
  document.body.appendChild(closeBtn);

  btn.onclick = function () {
    var isOpen = iframe.style.display === "block";
    iframe.style.display = isOpen ? "none" : "block";
    closeBtn.style.display = isOpen ? "none" : "flex";
  };

  closeBtn.onclick = function () {
    iframe.style.display = "none";
    closeBtn.style.display = "none";
  };
})();
