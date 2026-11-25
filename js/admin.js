function tampilHasil() {
  const hasil = JSON.parse(localStorage.getItem('hasil_ujian') || '[]');
  const div = document.getElementById('hasil');
  if (hasil.length === 0) {
    div.innerHTML = "<p>Belum ada hasil.</p>";
    return;
  }
  let html = "";
  hasil.forEach((h, idx) => {
    html += `<div style="border:1px solid #ddd; padding:12px; margin:10px 0; border-radius:8px; background:#fff;">
      <b>${idx+1}. ${h.nama} - ${h.mapel}</b><br>
      Benar ${h.benar}/${h.total} - Nilai ${h.nilai} - Pelanggaran ${h.pelanggaran} - ${h.waktu}<br>
      <button onclick="lihatDetail(${idx})" style="margin-top:8px; padding:6px 12px; cursor:pointer;">🔍 Lihat Detail Soal</button>
      <div id="detail-${idx}" style="display:none; margin-top:10px;"></div>
    </div>`;
  });
  div.innerHTML = html;
}

function lihatDetail(idx) {
  const hasil = JSON.parse(localStorage.getItem('hasil_ujian') || '[]');
  const h = hasil[idx];
  const div = document.getElementById(`detail-${idx}`);
  if (div.style.display === "block") { div.style.display = "none"; return; }
  if (!h.detail) {
    div.innerHTML = "<p style='color:red'>Detail tidak tersedia (ujian lama, sebelum upgrade).</p>";
    div.style.display = "block";
    return;
  }
  let html = "<b>Detail Jawaban:</b><br>";
  h.detail.forEach(d => {
    const icon = d.benar ? "✅" : "❌";
    const warna = d.benar ? "green" : "red";
    const opsiSiswa = d.jawabanSiswaIndex >= 0 ? d.opsi[d.jawabanSiswaIndex] : "-";
    const opsiKunci = d.opsi[d.kunciIndex];
    html += `<div style="margin:8px 0; padding:10px; background:#f5f5f5; border-radius:6px; border-left:4px solid ${warna};">
      <b>${icon} No ${d.no}:</b> ${d.soal}<br>
      <span style="color:${warna}">Jawaban Siswa: ${d.jawabanSiswa} - ${opsiSiswa} | Kunci: ${d.kunci} - ${opsiKunci}</span>
    </div>`;
  });
  div.innerHTML = html;
  div.style.display = "block";
}

function downloadCSV() {
  const hasil = JSON.parse(localStorage.getItem('hasil_ujian') || '[]');
  if (hasil.length === 0) { alert("Belum ada hasil"); return; }
  let csv = "Nama,Mapel,Benar,Total,Nilai,Pelanggaran,Waktu,Detail\n";
  hasil.forEach(h => {
    let detailStr = "";
    if (h.detail) {
      detailStr = h.detail.map(d => `No${d.no}:${d.jawabanSiswa}${d.benar ? "(Benar)" : "(Salah,Kunci:" + d.kunci + ")"}`).join(" | ");
    } else {
      detailStr = "Tidak ada detail";
    }
    csv += `"${h.nama}","${h.mapel}",${h.benar},${h.total},${h.nilai},${h.pelanggaran},"${h.waktu}","${detailStr}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "hasil_ujian.csv";
  a.click();
}

function buatToken() {
  const token = document.getElementById('tokenBaru').value.trim();
  if (!token) { alert("Isi token dulu!"); return; }
  localStorage.setItem('token_ujian', token);
  document.getElementById('infoToken').innerText = "Token sekarang: " + token;
}

function resetUjian() {
  if (!confirm("Yakin reset semua hasil?")) return;
  localStorage.removeItem('hasil_ujian');
  tampilHasil();
}