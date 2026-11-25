function buatToken() {
  let t = document.getElementById('tokenBaru').value.trim();
  if (!t) { alert("Isi token dulu!"); return; }
  localStorage.setItem('token_ujian', t);
  document.getElementById('infoToken').textContent = "Token aktif: " + t;
}
function tampilHasil() {
  let data = JSON.parse(localStorage.getItem('hasil_ujian') || '[]');
  if (!data.length) { document.getElementById('hasil').innerHTML = "<p>Belum ada hasil.</p>"; return; }
  let html = "<h3>Hasil Ujian</h3>";
  data.forEach((d,i) => { html += `<p>${i+1}. <b>${d.nama}</b> - ${d.mapel} - Benar ${d.benar}/${d.total} - Nilai ${d.nilai} - Pelanggaran ${d.pelanggaran} - ${d.waktu}</p>`; });
  document.getElementById('hasil').innerHTML = html;
}
function downloadCSV() {
  let data = JSON.parse(localStorage.getItem('hasil_ujian') || '[]');
  if (!data.length) { alert("Belum ada hasil!"); return; }
  let csv = "Nama,Mapel,Benar,Total,Nilai,Pelanggaran,Waktu\n";
  data.forEach(d => { csv += `"${d.nama}","${d.mapel}",${d.benar},${d.total},${d.nilai},${d.pelanggaran},"${d.waktu}"\n`; });
  let blob = new Blob([csv], { type: 'text/csv' });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'hasil_ujian.csv';
  a.click();
}
function resetUjian() {
  if (confirm("Hapus semua hasil?")) { localStorage.removeItem('hasil_ujian'); alert("Sudah direset!"); }
}
let t = localStorage.getItem('token_ujian');
if (t) document.getElementById('infoToken').textContent = "Token aktif: " + t;