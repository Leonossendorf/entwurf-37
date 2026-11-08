(function () {
  "use strict";
  var doc = document.documentElement;

  /* ---- Schrift größer ---- */
  var schrift = document.getElementById("schrift");
  try { if (localStorage.getItem("hih-gross") === "1") { doc.classList.add("gross"); schrift.setAttribute("aria-pressed", "true"); } } catch (e) {}
  schrift.addEventListener("click", function () {
    var an = doc.classList.toggle("gross");
    schrift.setAttribute("aria-pressed", an ? "true" : "false");
    try { localStorage.setItem("hih-gross", an ? "1" : "0"); } catch (e) {}
  });

  /* ---- Register (Tabs) ---- */
  function register(liste) {
    var tabs = Array.prototype.slice.call(liste.querySelectorAll("[role=tab]"));
    function zeige(tab, fokus) {
      tabs.forEach(function (t) {
        var an = t === tab;
        t.setAttribute("aria-selected", an ? "true" : "false");
        t.tabIndex = an ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !an;
      });
      if (fokus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { zeige(t); });
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") n = tabs[0];
        if (e.key === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); zeige(n, true); }
      });
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll("[role=tablist]"), register);

  /* ---- Büro jetzt besetzt? (Zeit in Ochtrup) ---- */
  var TAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var ZEITEN = { 1: [9, 13], 2: [9, 13], 3: [9, 13], 4: [9, 13], 5: [9, 12] };
  function jetztInOchtrup() {
    var s = new Date().toLocaleString("en-US", { timeZone: "Europe/Berlin" });
    return new Date(s);
  }
  function status() {
    var d = jetztInOchtrup(), tag = d.getDay(), std = d.getHours() + d.getMinutes() / 60;
    var z = ZEITEN[tag];
    if (z && std >= z[0] && std < z[1]) {
      return { offen: true, text: "Büro jetzt besetzt, bis " + z[1] + " Uhr" };
    }
    // nächste Öffnung suchen
    for (var i = 0; i < 8; i++) {
      var t = (tag + i) % 7, zz = ZEITEN[t];
      if (!zz) continue;
      if (i === 0 && std >= zz[0]) continue;
      var wann = i === 0 ? "heute" : i === 1 ? "morgen" : TAGE[t];
      return { offen: false, text: "Büro wieder " + wann + " ab " + zz[0] + " Uhr · Rückruf gern hier anfragen" };
    }
    return { offen: false, text: "" };
  }
  var st = status();
  Array.prototype.forEach.call(document.querySelectorAll("[data-status]"), function (el) {
    el.classList.toggle("offen", st.offen);
    el.querySelector("[data-status-text]").textContent = st.text;
  });

  /* ---- Vorauswahl über Links (z. B. „Betreuung anfragen") ---- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-preset]"), function (a) {
    a.addEventListener("click", function () {
      var p = a.getAttribute("data-preset").split(":");
      var r = document.querySelector('input[name="' + p[0] + '"][value="' + p[1] + '"]');
      if (r) r.checked = true;
    });
  });

  /* ---- Stellen antippen → im Bewerbungsformular wählen ---- */
  var auswahl = document.getElementById("b-stelle");
  var knoepfe = Array.prototype.slice.call(document.querySelectorAll("[data-stelle]"));
  knoepfe.forEach(function (b) {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      knoepfe.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      auswahl.value = b.getAttribute("data-stelle");
      var form = document.getElementById("form-bewerbung");
      if (window.matchMedia("(max-width: 1060px)").matches) form.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () { auswahl.focus({ preventScroll: true }); }, 350);
    });
  });
  auswahl.addEventListener("change", function () {
    knoepfe.forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-stelle") === auswahl.value ? "true" : "false"); });
  });

  /* ---- Formulare (Entwurf: nichts wird versendet) ---- */
  Array.prototype.forEach.call(document.querySelectorAll("form.formular"), function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var tel = f.querySelector('[name="telefon"]').value.trim();
      var mail = f.querySelector('[name="email"]').value.trim();
      var fehler = f.querySelector(".fehler");
      if (!tel && !mail) { fehler.hidden = false; f.querySelector('[name="telefon"]').focus(); return; }
      fehler.hidden = true;
      var danke = f.querySelector(".danke");
      danke.hidden = false;
      danke.focus();
    });
  });

  /* ---- sanftes Einblenden ---- */
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var els = document.querySelectorAll(".abschnitt__kopf, .mappe, .woche-block, .fragen, .formular, .team li, .stellen, .vorteile");
    var io = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("da"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(els, function (el) { el.classList.add("rein"); io.observe(el); });
  }
})();
