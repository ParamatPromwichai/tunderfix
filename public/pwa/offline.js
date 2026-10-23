const statusElement = document.getElementById("network-state");
const label = document.getElementById("network-label");
function updateNetworkState() {
  statusElement.classList.toggle("online", navigator.onLine);
  label.textContent = navigator.onLine
    ? "พบเครือข่ายแล้ว กดลองเชื่อมต่ออีกครั้ง"
    : "ไม่มีเครือข่ายอินเทอร์เน็ต";
}
document.getElementById("retry").addEventListener("click", () => {
  if (window.location.pathname === "/offline.html")
    window.location.replace("/launch");
  else window.location.reload();
});
window.addEventListener("online", updateNetworkState);
window.addEventListener("offline", updateNetworkState);
updateNetworkState();
