const API_BASE = "https://NAMA-PROJECT.vercel.app"; // ganti dengan domain Vercel kamu

function extractId(url) {
  const v = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (v) return v[1];
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (short) return short[1];
  const shorts = url.match(/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (shorts) return shorts[1];
  return url.trim();
}

async function getInfo() {
  const url = document.getElementById("urlInput").value.trim();
  const id = extractId(url);
  if (!id) return showError("URL tidak valid");

  showError("");
  document.getElementById("info").innerHTML = "Loading...";

  try {
    const res = await fetch(`${API_BASE}/api/get-video-info/${id}`);
    const data = await res.json();
    renderInfo(id, data);
  } catch (err) {
    showError("Gagal ambil info: " + err.message);
    document.getElementById("info").innerHTML = "";
  }
}

function renderInfo(id, data) {
  let html = `<h3>${data.title || data.videoDetails?.title || "Judul tidak tersedia"}</h3>`;
  html += `<p>Channel: ${data.author || data.videoDetails?.author || ""}</p>`;

  if (Array.isArray(data.formats)) {
    html += "<h4>Pilih kualitas:</h4>";
    data.formats.forEach(f => {
      html += `
        <div class="format">
          <span>${f.qualityLabel || f.quality || f.itag}</span>
          <button onclick="downloadVideo('${id}','${f.itag || f.quality}')">Download</button>
        </div>`;
    });
  }

  html += `<div style="margin-top:10px">
    <button onclick="downloadVideo('${id}','')">Download Otomatis</button>
    <button onclick="downloadShort('${id}','')">Download Shorts</button>
  </div>`;

  document.getElementById("info").innerHTML = html;
}

async function downloadVideo(id, quality) {
  try {
    const res = await fetch(`${API_BASE}/api/download-video/${id}${quality ? `?quality=${quality}` : ""}`);
    const data = await safeJson(res);
    handleDownloadResponse(data);
  } catch (err) {
    alert("Error download video: " + err.message);
  }
}

async function downloadShort(id, quality) {
  try {
    const res = await fetch(`${API_BASE}/api/download-short/${id}${quality ? `?quality=${quality}` : ""}`);
    const data = await safeJson(res);
    handleDownloadResponse(data);
  } catch (err) {
    alert("Error download short: " + err.message);
  }
}

async function safeJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { url: text };
  }
}

function handleDownloadResponse(data) {
  let url =
    data?.url ||
    data?.downloadUrl ||
    data?.result?.url ||
    data?.file ||
    (typeof data === "string" ? data : null);

  if (url) {
    window.open(url, "_blank");
  } else {
    alert("URL download tidak ditemukan. Cek console.");
    console.log("Response backend:", data);
  }
}

function showError(msg) {
  document.getElementById("error").innerText = msg;
}
