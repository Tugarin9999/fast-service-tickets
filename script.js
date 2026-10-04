// Базовая логика уже работает — форма добавляет заявку в очередь.
// ИИ-функция — классификация заявки по категории, см. classifyTicket ниже.

const STORAGE_KEY = "fastservice-tickets";

function loadTickets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTickets(tickets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

const CATEGORY_RULES = [
  {
    category: "Возврат",
    patterns: [
      [/верн\S{0,6}\s+деньг/, 3],
      [/верн\S{0,6}\s+средств/, 3],
      [/верн\S{0,6}\s+(товар|покупк)/, 3],
      [/возврат/, 2],
      [/обмен/, 2],
      [/отказ/, 2],
      [/отмени/, 2],
      [/не подош/, 2],
      [/верн/, 1],
      [/брак/, 1],
    ],
  },
  {
    category: "Оплата",
    patterns: [
      [/оплат/, 2],
      [/платеж/, 2],
      [/счет(?!чик)/, 2],
      [/квитанц/, 2],
      [/чек/, 2],
      [/карт(?!оф)/, 2],
      [/перечисл/, 2],
      [/цен[ауыейо]/, 2],
      [/стоимост/, 2],
      [/тариф/, 2],
      [/списа/, 2],
      [/комисси/, 2],
      [/рассроч/, 2],
      [/подписк/, 2],
      [/кредит/, 2],
      [/наличн/, 2],
      [/касса/, 2],
      [/банкомат/, 2],
      [/терминал/, 2],
      [/зачисл/, 2],
      [/долг/, 2],
      [/деньг/, 1],
      [/перевод/, 1],
      [/средств/, 1],
    ],
  },
  {
    category: "Техническая",
    patterns: [
      [/не работа/, 2],
      [/неисправн/, 2],
      [/поломк/, 2],
      [/не включа/, 2],
      [/не запуска/, 2],
      [/не гре/, 2],
      [/не суш/, 2],
      [/не слива/, 2],
      [/не набира/, 2],
      [/течет/, 2],
      [/шумит/, 2],
      [/вибрир/, 2],
      [/скрипит/, 2],
      [/ошибк/, 2],
      [/ремонт/, 2],
      [/слом/, 1],
      [/протека/, 1],
      [/гудит/, 1],
      [/трещит/, 1],
      [/мигает/, 1],
      [/не реагир/, 1],
      [/не закрыва/, 1],
      [/не открыва/, 1],
      [/не горит/, 1],
      [/застрял/, 1],
      [/заклини/, 1],
      [/холодильник/, 1],
      [/стиральн/, 1],
      [/посудомоечн/, 1],
      [/микроволнов/, 1],
      [/пылесос/, 1],
      [/кофемашин/, 1],
      [/варочн/, 1],
      [/кондиционер/, 1],
      [/телевизор/, 1],
      [/духовк/, 1],
      [/чайник/, 1],
    ],
  },
];

const FALLBACK_CATEGORY = "Техническая";

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/\s+/g, " ")
    .trim();
}

function countMatches(normalizedText, patterns) {
  return patterns.reduce(
    (score, entry) => (entry[0].test(normalizedText) ? score + entry[1] : score),
    0
  );
}

function classifyTicket(text) {
  const normalized = normalizeText(text);

  let bestCategory = FALLBACK_CATEGORY;
  let bestScore = 0;

  for (const rule of CATEGORY_RULES) {
    const score = countMatches(normalized, rule.patterns);
    if (score > bestScore) {
      bestCategory = rule.category;
      bestScore = score;
    }
  }

  return bestCategory;
}

function render() {
  const tickets = loadTickets();
  const list = document.getElementById("ticketList");
  list.innerHTML = "";

  tickets.forEach((ticket) => {
    const li = document.createElement("li");

    const nameEl = document.createElement("div");
    nameEl.className = "ticket-name";
    nameEl.textContent = ticket.name;

    const textEl = document.createElement("p");
    textEl.textContent = ticket.text;

    const categoryEl = document.createElement("span");
    categoryEl.className = "ticket-category";
    categoryEl.textContent = ticket.category;

    li.appendChild(nameEl);
    li.appendChild(textEl);
    li.appendChild(categoryEl);
    list.appendChild(li);
  });
}

document.getElementById("ticketForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("ticketName").value.trim();
  const text = document.getElementById("ticketText").value.trim();
  if (!name || !text) return;

  const category = classifyTicket(text);
  const tickets = loadTickets();
  tickets.unshift({ name, text, category });
  saveTickets(tickets);

  e.target.reset();
  render();
});

render();