let soalAcak = [], index = 0, jawaban = [], waktu = 90, timer = null, pelanggaran = 0, namaPeserta = "", mapelDipilih = "";

function acakPerPeserta(array, seed) {
  let s = seed.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  function rand() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function mulaiUjian() {
  namaPeserta = document.getElementById('nama').value.trim();
  let token = document.getElementById('token').value.trim();
  mapelDipilih = document.getElementById('mapel').value;
  if (!namaPeserta || !token) { alert("Isi nama dan token dulu!"); return; }
  const { data: tokenData } = await supabaseClient.from('token_ujian').select('token').eq('id', 1).single();
if (!tokenData || token !== tokenData.token) { alert("Token salah!"); return; }
   { alert("Token salah!"); return; }
  try {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById('kamera').srcObject = stream;
  } catch(e) { alert("Wajib izinkan kamera!"); return; }
  try { await document.documentElement.requestFullscreen(); } catch(e) {}
  document.getElementById('formLogin').style.display = 'none';
  document.getElementById('areaUjian').style.display = 'block';
  document.getElementById('infoMapel').textContent = "Mapel: " + mapelDipilih + " | Peserta: " + namaPeserta;
  soalAcak = acakPerPeserta(BANK_SOAL[mapelDipilih], namaPeserta + mapelDipilih);
  index = 0; jawaban = [];
  tampilSoal();
  aktifkanAntiCheat();
}

function tampilSoal() {
  if (index >= soalAcak.length) { selesaiUjian(); return; }
  waktu = 90;
  clearInterval(timer);
  timer = setInterval(() => {
    waktu--;
    let el = document.getElementById('timer');
    el.textContent = waktu + " detik";
    el.classList.toggle('mauHabis', waktu <= 10);
    if (waktu <= 0) nextSoal();
  }, 1000);
  let s = soalAcak[index];
  document.getElementById('soal').textContent = (index+1) + ". " + s.q;
  document.getElementById('progress').textContent = "Soal " + (index+1) + " dari " + soalAcak.length;
  document.getElementById('progressFill').style.width = ((index / soalAcak.length) * 100) + "%";
  let html = "";
  s.opsi.forEach((o,i) => { html += `<label class="opsi" onclick="pilihOpsi(this)"><input type="radio" name="opsi" value="${i}"> ${o}</label>`; });
  document.getElementById('opsi').innerHTML = html;
}

function pilihOpsi(el) {
  document.querySelectorAll('.opsi').forEach(o => o.classList.remove('pilih'));
  el.classList.add('pilih');
  el.querySelector('input').checked = true;
}

function nextSoal() {
  let pilih = document.querySelector('input[name="opsi"]:checked');
  jawaban.push(pilih ? parseInt(pilih.value) : -1);
  index++;
  tampilSoal();
}

function selesaiUjian() {
  clearInterval(timer);
  let benar = 0;
  soalAcak.forEach((s,i) => { if (jawaban[i] === s.jawab) benar++; });
  let nilai = Math.round((benar / soalAcak.length) * 100);

  // === BARU: DETAIL PER SOAL ===
  const huruf = ["A","B","C","D","E"];
  const detail = soalAcak.map((s, i) => {
    const jwb = jawaban[i];
    return {
      no: i + 1,
      soal: s.q,
      opsi: s.opsi,
      jawabanSiswa: jwb === -1 ? "Kosong" : huruf[jwb],
      jawabanSiswaIndex: jwb,
      kunci: huruf[s.jawab],
      kunciIndex: s.jawab,
      benar: jwb === s.jawab
    };
  });

  let hasil = { 
    nama: namaPeserta, 
    mapel: mapelDipilih, 
    benar: benar, 
    total: soalAcak.length, 
    nilai: nilai, 
    pelanggaran: pelanggaran, 
    waktu: new Date().toLocaleString('id-ID'),
    detail: detail
  };
  let semua = JSON.parse(localStorage.getItem('hasil_ujian') || '[]');
  semua.push(hasil);
  localStorage.setItem('hasil_ujian', JSON.stringify(semua));
  document.getElementById('progressFill').style.width = "100%";
  document.getElementById('areaUjian').innerHTML = `<h2>Ujian Selesai! 🎉</h2><p>Nama: ${namaPeserta}</p><p>Mapel: ${mapelDipilih}</p><p>Benar: ${benar} / ${soalAcak.length}</p><p>Nilai: ${nilai}</p><p>Pelanggaran: ${pelanggaran}</p><button class="btn" onclick="location.reload()">Kembali</button>`;
  if (document.fullscreenElement) document.exitFullscreen();
  buatConfetti();
}

function buatConfetti() {
  const warna = ["#667eea","#764ba2","#f093fb","#4facfe","#fbbf24","#34d399"];
  for (let i = 0; i < 80; i++) {
    let c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = warna[Math.floor(Math.random() * warna.length)];
    c.style.animationDelay = Math.random() * 1 + "s";
    c.style.borderRadius = Math.random() > .5 ? "50%" : "2px";
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}

function aktifkanAntiCheat() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pelanggaran++; updatePelanggaran(); alert("Jangan pindah tab! Pelanggaran: " + pelanggaran); if (pelanggaran >= 3) kunciUjian(); }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && document.getElementById('areaUjian').style.display !== 'none') {
      pelanggaran++; updatePelanggaran(); alert("Wajib fullscreen!"); document.documentElement.requestFullscreen(); if (pelanggaran >= 3) kunciUjian();
    }
  });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && ['c','v','u','s'].includes(e.key.toLowerCase()))) e.preventDefault();
  });
  setInterval(() => {
    let video = document.getElementById('kamera');
    if (video && video.srcObject) {
      let canvas = document.createElement('canvas');
      canvas.width = 160; canvas.height = 120;
      canvas.getContext('2d').drawImage(video, 0, 0, 160, 120);
      localStorage.setItem('foto_' + namaPeserta + '_' + Date.now(), canvas.toDataURL('image/jpeg', 0.5));
    }
  }, 30000);
}

function updatePelanggaran() { document.getElementById('pelanggaran').textContent = "Pelanggaran: " + pelanggaran + " / 3"; }
function kunciUjian() { alert("Ujian dikunci karena 3x pelanggaran!"); selesaiUjian(); }