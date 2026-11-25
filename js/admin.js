async function tampilHasil() {
  const { data: hasil, error } = await supabaseClient.from('hasil_ujian').select('*').order('waktu', { ascending: false });
  const div = document.getElementById('hasil');
  if (error || !hasil || hasil.length === 0) { div.innerHTML = "<p>Belum ada hasil.</p>"; return; }
  let html = "";
  hasil.forEach((h, idx) => {
    html += `<div style="border:1px solid #ddd; padding:12px; margin:10px 0; border-radius:8px; background:#fff;">
      <b>${idx+1}. ${h.nama} - ${h.mapel}</b><br>
      Benar ${h.benar}/${h.total} - Nilai ${h.nilai} - Pelanggaran ${h.pelanggaran} - ${new Date(h.waktu).toLocaleString('id-ID')}<br>
      <button onclick="lihatDetail('${h.id}')" style="margin-top:8px; padding:6px 12px; cursor:pointer;">🔍 Lihat Detail Soal</button>
      <div id="detail-${h.id}" style="display:none; margin-top:10px;"></div>
    </div>`;
  });
  div.innerHTML = html;
  window._hasilCache = hasil;
}

async function lihatDetail(id) {
  const div = document.getElementById(`detail-${id}`);
  if (div.style.display === "block") { div.style.display = "none"; return; }
  const h = window._hasilCache.find(x => x.id === id);
  if (!h || !h.detail) { div.innerHTML = "<p>Detail tidak tersedia.</p>"; div.style.display = "block"; return; }
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

async function downloadExcel() {
  const { data: hasil } = await supabaseClient.from('hasil_ujian').select('*').order('waktu', { ascending: true });
  if (!hasil || hasil.length === 0) { alert("Belum ada hasil"); return; }
  const rows = hasil.map(h => ({
    Nama: h.nama, Mapel: h.mapel, Benar: h.benar, Total: h.total, Nilai: h.nilai,
    Pelanggaran: h.pelanggaran, Waktu: new Date(h.waktu).toLocaleString('id-ID'),
    Detail: h.detail ? h.detail.map(d => `No${d.no}:${d.jawabanSiswa}${d.benar ? "(Benar)" : "(Salah,Kunci:" + d.kunci + ")"}`).join(" | ") : "Tidak ada detail"
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hasil Ujian");
  XLSX.writeFile(wb, "hasil_ujian.xlsx");
}

async function downloadPDF() {
  const { data: hasil } = await supabaseClient.from('hasil_ujian').select('*').order('waktu', { ascending: true });
  if (!hasil || hasil.length === 0) { alert("Belum ada hasil"); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16); doc.text("LAPORAN HASIL UJIAN", 14, 15);
  doc.setFontSize(10); doc.text("SMA 11 - " + new Date().toLocaleDateString('id-ID'), 14, 22);
  const body = hasil.map(h => [h.nama, h.mapel, h.benar + "/" + h.total, h.nilai, h.pelanggaran, new Date(h.waktu).toLocaleString('id-ID')]);
  doc.autoTable({ head: [["Nama","Mapel","Benar","Nilai","Pelanggaran","Waktu"]], body: body, startY: 28 });
  doc.save("laporan_ujian.pdf");
}

async function buatToken() {
  const token = document.getElementById('tokenBaru').value.trim();
  if (!token) { alert("Isi token dulu!"); return; }
  const { error } = await supabaseClient.from('token_ujian').update({ token: token, updated_at: new Date().toISOString() }).eq('id', 1);
  if (error) { alert("Gagal ganti token: " + error.message); return; }
  document.getElementById('infoToken').innerText = "Token sekarang: " + token;
  alert("Token berhasil diganti!");
}

async function resetUjian() {
  if (!confirm("Yakin hapus semua hasil?")) return;
  await supabaseClient.from('hasil_ujian').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  tampilHasil();
}