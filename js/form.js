(function () {
  "use strict";
  Array.prototype.forEach.call(document.querySelectorAll("form.formular"), function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = f.querySelector('[name="telefon"]').value.trim() || f.querySelector('[name="email"]').value.trim();
      f.querySelector(".fehler").hidden = !!ok;
      if (!ok) { f.querySelector('[name="telefon"]').focus(); return; }
      var d = f.querySelector(".danke"); d.hidden = false; d.focus();
    });
  });
})();
