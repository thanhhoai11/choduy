document.addEventListener("DOMContentLoaded", function () {
  // Tải footer
  fetch("component/footer.html")
    .then(response => {
      if (!response.ok) throw new Error("Không thể tải footer.");
      return response.text();
    })
    .then(html => {
      const footerPlaceholder = document.getElementById("footer-placeholder");
      if (footerPlaceholder) {
        footerPlaceholder.innerHTML = html;
      } else {
        console.error("Footer placeholder not found: #footer-placeholder");
      }
    })
    .catch(error => console.error("Lỗi khi tải footer:", error));
});