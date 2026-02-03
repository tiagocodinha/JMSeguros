/* /js/seguro.js
   Simulação (categorias/tabs) + validações + submit handler (static friendly)

   ✅ Compatível com:
   - form id="autoQuoteForm" OU id="quoteForm"
   - tabs: .quote-cat[data-category="..."]
   - panels: .category-panel[data-category-panel="..."]
   - hidden: input#categoria (opcional) ou input[name="categoria"]
   - status: #formStatus (opcional)
   - container tabs p/ scroll horizontal: .quote-categories

   NOTA:
   - API_ENDPOINT vazio => não faz fetch (static friendly)
*/

(() => {
  // =========================
  // CONFIG
  // =========================
  const API_ENDPOINT = ""; // ex: "https://teu-backend.com/api/lead"

  // =========================
  // HELPERS
  // =========================
  const byId = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const trim = (s) => (s || "").trim();
  const onlyDigits = (s) => (s || "").replace(/\D+/g, "");

  const isVisible = (el) =>
    !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));

  const runWhenReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  // =========================
  // FORM / TABS / VALIDATION
  // =========================
  const initSeguroForm = () => {
    const form = byId("autoQuoteForm") || byId("quoteForm");
    if (!form) return;

    const statusEl = byId("formStatus");

    const categoriaInput =
      byId("categoria") || form.querySelector('input[name="categoria"]');

    const formTitle =
      byId("formTitle") || byId("form-title") || qs("[data-form-title]");

    const catButtons = qsa(".quote-cat[data-category]");
    const panels = qsa(".category-panel[data-category-panel]");

    const catsScroller =
      qs(".quote-categories") ||
      qs(".sim-cats") ||
      qs(".quote-cats") ||
      qs(".categories-bar") ||
      null;

    const header = qs(".header");
    const getScrollTarget = () => form.closest(".form-card") || form;

    const fieldValue = (id) => trim(byId(id)?.value);

    const showStatus = (msg, type = "") => {
      if (!statusEl) return;
      statusEl.className = "form-status" + (type ? ` ${type}` : "");
      statusEl.textContent = msg || "";
    };

    const setError = (fieldId, message = "") => {
      if (!fieldId) return;

      const field = byId(fieldId);
      const err = form.querySelector(`[data-error-for="${fieldId}"]`);

      if (field) field.classList.toggle("error", !!message);

      if (err) {
        err.textContent = message;
        err.classList.toggle("show", !!message);
      }
    };

    const clearAllErrors = () => {
      qsa(".q-error", form).forEach((e) => {
        e.textContent = "";
        e.classList.remove("show");
      });

      qsa(".error", form).forEach((e) => e.classList.remove("error"));
    };

    // =========================
    // DATE HELPERS
    // =========================
    const parseDate = (value) => {
      if (!value) return null;
      const d = new Date(value + "T00:00:00");
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const today = () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const isPastDate = (value) => {
      const d = parseDate(value);
      if (!d) return false;
      return d.getTime() < today().getTime();
    };

    const isTodayOrFuture = (value) => {
      const d = parseDate(value);
      if (!d) return false;
      return d.getTime() >= today().getTime();
    };

    // =========================
    // VALIDATORS
    // =========================
    const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

    const isPhonePTValid = (phone) => {
      const p = onlyDigits(phone);
      return /^9\d{8}$/.test(p);
    };

    const isPostalPTValid = (cp) => /^\d{4}-\d{3}$/.test(trim(cp));

    const isNIFValid = (nif) => {
      const n = onlyDigits(nif);
      if (!/^\d{9}$/.test(n)) return false;

      const digits = n.split("").map((x) => parseInt(x, 10));
      let sum = 0;

      for (let i = 0; i < 8; i++) sum += digits[i] * (9 - i);

      const mod11 = sum % 11;
      const check = mod11 < 2 ? 0 : 11 - mod11;

      return digits[8] === check;
    };

    const isMatriculaPTValid = (m) => {
      const raw = trim(m).toUpperCase().replace(/\s+/g, "");
      const normalized = raw.replace(/-/g, "");

      if (!/^[A-Z0-9]{6}$/.test(normalized)) return false;

      const a = "[A-Z]{2}";
      const d = "\\d{2}";

      const patterns = [
        new RegExp(`^${a}${d}${a}$`), // AA00AA
        new RegExp(`^${d}${a}${d}$`), // 00AA00
        new RegExp(`^${a}${d}${d}$`), // AA0000
        new RegExp(`^${d}${d}${a}$`), // 0000AA
      ];

      return patterns.some((p) => p.test(normalized));
    };

    const isMinWords = (text, minWords = 2) => {
      const parts = trim(text).split(/\s+/).filter(Boolean);
      return parts.length >= minWords;
    };

    // =========================
    // SCROLL HELPERS
    // =========================
    const getHeaderOffset = () => (header ? header.offsetHeight : 0) + 14;

    const calcTargetY = (el) => {
      const y = el.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
      return Math.max(0, y);
    };

    const shouldScrollTo = (targetY) => Math.abs(window.pageYOffset - targetY) > 80;

    const scrollToTarget = () => {
      const targetEl = getScrollTarget();
      const y = calcTargetY(targetEl);
      if (!shouldScrollTo(y)) return;
      window.scrollTo({ top: y, behavior: "smooth" });
    };

    // =========================
    // TABS UI
    // =========================
    const revealActiveTab = (btn) => {
      if (!btn) return;

      if (catsScroller) {
        try {
          btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          return;
        } catch (_) {}
      }

      try {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (_) {}
    };

    const getActiveCategory = () => {
      const btn = catButtons.find((b) => b.classList.contains("active"));
      const key = btn?.dataset?.category;
      return key || (categoriaInput ? categoriaInput.value : "auto");
    };

    const setActiveCategory = (key, { doScroll = false } = {}) => {
      catButtons.forEach((btn) => {
        const active = btn.dataset.category === key;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });

      panels.forEach((p) => {
        p.classList.toggle("active", p.dataset.categoryPanel === key);
      });

      if (categoriaInput) categoriaInput.value = key;

      if (formTitle) {
        const titles = {
          auto: "Pedido de Simulação — Auto",
          moto: "Pedido de Simulação — Moto",
          acidentes: "Pedido de Simulação — Acidentes Pessoais",
          saude: "Pedido de Simulação — Saúde",
          vida: "Pedido de Simulação — Vida Risco",
          hab: "Pedido de Simulação — Multirriscos Habitação",
          ppr: "Pedido de Simulação — PPR",
          rc: "Pedido de Simulação — Responsabilidade Civil Geral",
        };

        formTitle.textContent = titles[key] || "Pedido de Simulação";
      }

      clearAllErrors();
      showStatus("");

      const activeBtn = catButtons.find((b) => b.dataset.category === key);
      revealActiveTab(activeBtn);

      if (doScroll) scrollToTarget();
    };

    // =========================
    // VALIDATE
    // =========================
    const validateVisibleRequired = () => {
      clearAllErrors();
      showStatus("");

      let ok = true;

      const requiredFields = qsa("[required]", form).filter(isVisible);
      requiredFields.forEach((field) => {
        const v = trim(field.value);
        if (!v) {
          ok = false;
          if (field.id) setError(field.id, "Preenchimento obrigatório.");
        }
      });

      const checkIfVisible = (id, fn, msg) => {
        const el = byId(id);
        if (!el || !isVisible(el)) return;

        const v = trim(el.value);
        if (!v) return;

        if (!fn(v)) {
          ok = false;
          setError(id, msg);
        }
      };

      checkIfVisible("nome", (v) => isMinWords(v, 2), "Indique pelo menos nome e apelido.");
      checkIfVisible("codigo_postal", isPostalPTValid, "Código postal inválido (ex: 1234-567).");
      checkIfVisible("nif", isNIFValid, "NIF inválido (dígito de controlo).");
      checkIfVisible("telemovel", isPhonePTValid, "Telemóvel inválido (9 dígitos, começa por 9).");
      checkIfVisible("email", isEmailValid, "Email inválido.");

      checkIfVisible("data_nascimento", isPastDate, "A data de nascimento tem de ser no passado.");
      checkIfVisible("data_matricula", isPastDate, "A data da matrícula tem de ser no passado.");
      checkIfVisible("data_carta", isPastDate, "A data da carta tem de ser no passado.");
      checkIfVisible("inicio_seguro", isTodayOrFuture, "A data de início deve ser hoje ou no futuro.");

      checkIfVisible("matricula", isMatriculaPTValid, "Matrícula inválida (formatos PT comuns).");
      checkIfVisible("auto_matricula", isMatriculaPTValid, "Matrícula inválida (formatos PT comuns).");
      checkIfVisible("moto_matricula", isMatriculaPTValid, "Matrícula inválida (formatos PT comuns).");

      checkIfVisible("auto_data_matricula", isPastDate, "A data da matrícula tem de ser no passado.");
      checkIfVisible("auto_inicio", isTodayOrFuture, "A data de início deve ser hoje ou no futuro.");
      checkIfVisible("moto_data_matricula", isPastDate, "A data da matrícula tem de ser no passado.");
      checkIfVisible("moto_inicio", isTodayOrFuture, "A data de início deve ser hoje ou no futuro.");

      // cross-check: carta vs nascimento
      const dn = parseDate(fieldValue("data_nascimento"));
      const dc = parseDate(fieldValue("data_carta"));

      if (dn && dc) {
        if (dc.getTime() <= dn.getTime()) {
          ok = false;
          setError("data_carta", "A data da carta não pode ser anterior à data de nascimento.");
        } else {
          const minCarta = new Date(dn);
          minCarta.setFullYear(minCarta.getFullYear() + 16);

          if (dc.getTime() < minCarta.getTime()) {
            ok = false;
            setError("data_carta", "Data da carta parece muito cedo (verifique).");
          }
        }
      }

      // normalizações
      const telEl = byId("telemovel");
      if (telEl && isVisible(telEl)) telEl.value = onlyDigits(telEl.value);

      const nifEl = byId("nif");
      if (nifEl && isVisible(nifEl)) nifEl.value = onlyDigits(nifEl.value);

      const matEl = byId("matricula") || byId("auto_matricula") || byId("moto_matricula");
      if (matEl && isVisible(matEl)) matEl.value = trim(matEl.value).toUpperCase();

      return ok;
    };

    // =========================
    // REALTIME VALIDATION
    // =========================
    const attachRealtimeValidation = () => {
      const bind = (id, handler) => {
        const el = byId(id);
        if (!el) return;

        const evt = el.tagName === "SELECT" || el.type === "date" ? "change" : "input";

        el.addEventListener(
          evt,
          () => {
            if (!isVisible(el)) return;
            handler(el);
          },
          { passive: true }
        );
      };

      bind("nome", (el) => {
        const v = trim(el.value);
        setError("nome", v ? (isMinWords(v, 2) ? "" : "Indique nome e apelido.") : "");
      });

      bind("codigo_postal", (el) => {
        const v = trim(el.value);
        setError("codigo_postal", v ? (isPostalPTValid(v) ? "" : "Ex: 1234-567") : "");
      });

      bind("nif", (el) => {
        const v = trim(el.value);
        setError("nif", v ? (isNIFValid(v) ? "" : "NIF inválido.") : "");
      });

      bind("telemovel", (el) => {
        const v = trim(el.value);
        setError("telemovel", v ? (isPhonePTValid(v) ? "" : "Telemóvel inválido.") : "");
      });

      bind("email", (el) => {
        const v = trim(el.value);
        setError("email", v ? (isEmailValid(v) ? "" : "Email inválido.") : "");
      });

      ["matricula", "auto_matricula", "moto_matricula"].forEach((id) => {
        bind(id, (el) => {
          const v = trim(el.value);
          setError(id, v ? (isMatriculaPTValid(v) ? "" : "Matrícula inválida.") : "");
        });
      });

      ["data_nascimento", "data_matricula", "data_carta", "auto_data_matricula", "moto_data_matricula"].forEach(
        (id) => {
          bind(id, (el) => {
            const v = trim(el.value);
            setError(id, v ? (isPastDate(v) ? "" : "Tem de ser no passado.") : "");
          });
        }
      );

      ["inicio_seguro", "auto_inicio", "moto_inicio"].forEach((id) => {
        bind(id, (el) => {
          const v = trim(el.value);
          setError(id, v ? (isTodayOrFuture(v) ? "" : "Hoje ou futuro.") : "");
        });
      });
    };

    // =========================
    // PAYLOAD
    // =========================
    const getFormDataObject = () => {
      const fd = new FormData(form);
      const obj = {};

      fd.forEach((value, key) => {
        obj[key] = String(value);
      });

      if (obj.nif) obj.nif = onlyDigits(obj.nif);
      if (obj.telemovel) obj.telemovel = onlyDigits(obj.telemovel);

      const mat = obj.matricula || obj.auto_matricula || obj.moto_matricula || "";
      if (mat) obj.matricula_normalizada = trim(mat).toUpperCase();

      obj.categoria = obj.categoria || (categoriaInput ? categoriaInput.value : getActiveCategory());
      return obj;
    };

    // =========================
    // SUBMIT
    // =========================
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      showStatus("");

      const ok = validateVisibleRequired();

      if (!ok) {
        showStatus("Por favor, corrija os campos assinalados.", "error");

        const firstError = qs(".error", form);
        if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });

        return;
      }

      const payload = getFormDataObject();

      try {
        if (API_ENDPOINT) {
          showStatus("A enviar…", "");

          const res = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error("Falha no envio.");
        }

        showStatus("Pedido enviado com sucesso. Vamos contactar o mais breve possível.", "success");

        form.reset();

        const currentCat = payload.categoria || "auto";
        if (categoriaInput) categoriaInput.value = currentCat;

        setActiveCategory(currentCat, { doScroll: false });
      } catch (err) {
        showStatus("Não foi possível enviar agora. Tente novamente ou contacte-nos.", "error");
      }
    });

    // =========================
    // TABS CLICK
    // =========================
    if (catButtons.length) {
      catButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const key = btn.dataset.category;
          if (!key) return;
          setActiveCategory(key, { doScroll: true });
        });
      });
    }

    // =========================
    // INIT
    // =========================
    attachRealtimeValidation();

    const isValidCategory = (k) =>
      ["auto", "moto", "acidentes", "saude", "vida", "hab", "ppr", "rc"].includes(k);

    const urlCat = new URLSearchParams(window.location.search).get("cat");

    const initial =
      (urlCat && isValidCategory(urlCat) ? urlCat : null) ||
      (categoriaInput && isValidCategory(categoriaInput.value) ? categoriaInput.value : null) ||
      catButtons.find((b) => b.classList.contains("active"))?.dataset.category ||
      "auto";

    setActiveCategory(initial, { doScroll: false });

    // Se veio da home (com ?cat=...), faz scroll para o form
    if (urlCat && isValidCategory(urlCat)) {
      setTimeout(() => scrollToTarget(), 50);
    }
  };

  // =========================
  // BOOT
  // =========================
  runWhenReady(() => {
    initSeguroForm();
  });
})();
