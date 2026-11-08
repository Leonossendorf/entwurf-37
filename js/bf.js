/* Barrierefreiheit: Einstellungen werden nur auf diesem Gerät gespeichert, nichts geht an fremde Dienste. */
(function () {
  "use strict";
  var html = document.documentElement;
  var knopf = document.getElementById("bf-knopf"), menue = document.getElementById("bf-menue");
  if (!knopf || !menue) return;
  function hol(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function setz(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  var fs = menue.querySelectorAll("[data-fs]"), schalter = menue.querySelectorAll("[data-bf]");
  var vorlesen = document.getElementById("bf-vorlesen"), ss = window.speechSynthesis, stimme = null;

  function offen(an, fokus) {
    menue.hidden = !an;
    knopf.setAttribute("aria-expanded", an ? "true" : "false");
    if (an) { var erster = menue.querySelector("button"); if (erster) erster.focus(); }
    if (!an && fokus) knopf.focus();
  }
  function fsZeigen() {
    var n = html.classList.contains("fs-2") ? "2" : html.classList.contains("fs-1") ? "1" : "0";
    Array.prototype.forEach.call(fs, function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-fs") === n ? "true" : "false"); });
  }
  function fsSetzen(n) {
    html.classList.remove("fs-1", "fs-2");
    if (n && n !== "0") html.classList.add("fs-" + n);
    setz("hih-fs", n && n !== "0" ? n : null);
    fsZeigen();
  }
  function schalterZeigen() {
    var an = [];
    Array.prototype.forEach.call(schalter, function (b) {
      var name = b.getAttribute("data-bf"), ist = html.classList.contains("bf-" + name);
      b.setAttribute("aria-pressed", ist ? "true" : "false");
      if (ist) an.push(name);
    });
    setz("hih-bf", an.length ? an.join(",") : null);
  }
  function stopp() {
    if (!vorlesen || !ss) return;
    ss.cancel();
    vorlesen.setAttribute("aria-pressed", "false");
    vorlesen.textContent = "Seite vorlesen";
  }

  Array.prototype.forEach.call(fs, function (b) { b.addEventListener("click", function () { fsSetzen(b.getAttribute("data-fs")); }); });
  Array.prototype.forEach.call(schalter, function (b) {
    b.addEventListener("click", function () { html.classList.toggle("bf-" + b.getAttribute("data-bf")); schalterZeigen(); });
  });
  knopf.addEventListener("click", function () { offen(menue.hidden); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menue.hidden) offen(false, true); });
  document.addEventListener("click", function (e) {
    if (!menue.hidden && !menue.contains(e.target) && !knopf.contains(e.target)) offen(false);
  });
  document.getElementById("bf-zu").addEventListener("click", function () { offen(false, true); });
  document.getElementById("bf-zurueck").addEventListener("click", function () {
    Array.prototype.forEach.call(schalter, function (b) { html.classList.remove("bf-" + b.getAttribute("data-bf")); });
    fsSetzen("0"); schalterZeigen(); stopp();
  });
  fsZeigen(); schalterZeigen();

  /* Vorlesen nur mit einer deutschen Stimme, die auf dem Gerät selbst liegt */
  if (vorlesen && ss && window.SpeechSynthesisUtterance) {
    var suchen = function () {
      var alle = ss.getVoices().filter(function (v) { return /^de/i.test(v.lang); });
      stimme = alle.filter(function (v) { return v.localService; })[0] || null;
      vorlesen.hidden = !stimme;
      var hinweis = document.getElementById("bf-vorlesen-hinweis");
      if (hinweis) hinweis.hidden = !!stimme;
    };
    suchen();
    if (ss.addEventListener) ss.addEventListener("voiceschanged", suchen);
    vorlesen.addEventListener("click", function () {
      if (vorlesen.getAttribute("aria-pressed") === "true") { stopp(); return; }
      var teile = Array.prototype.filter.call(document.querySelectorAll("main h1, main h2, main h3, main p, main li, main summary, main th, main td, main legend"), function (el) {
        return el.offsetParent !== null && el.textContent.trim() && !(el.parentElement && el.parentElement.closest("li, td, th, p, summary"));
      });
      if (!teile.length) return;
      vorlesen.setAttribute("aria-pressed", "true");
      vorlesen.textContent = "Vorlesen stoppen";
      teile.forEach(function (el, i) {
        var u = new SpeechSynthesisUtterance(el.textContent.replace(/\s+/g, " ").trim());
        u.voice = stimme; u.lang = stimme.lang; u.rate = 0.95;
        if (i === teile.length - 1) u.onend = stopp;
        ss.speak(u);
      });
    });
    window.addEventListener("pagehide", stopp);
  }
})();
