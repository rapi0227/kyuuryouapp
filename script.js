const RULE = {
  drinkBack: 200,
  inBack: 200,
  mainBack: 500,
  douhanRate: 0.1,
  taxRate: 0.12,
  hair: 500,
  welfare: 500,
  dailyPay: 5000
};

// ===== DOM =====
const dateInput = document.getElementById("date");
const hourlyInput = document.getElementById("hourly");
const hoursInput = document.getElementById("hours");
const drinkInput = document.getElementById("drink");
const inNomiInput = document.getElementById("inNomi");
const mainNomiInput = document.getElementById("mainNomi");
const douhanSalesInput = document.getElementById("douhanSales");

const hairCheckbox = document.getElementById("hairMake");
const welfareCheckbox = document.getElementById("welfare");
const dailyPayCheckbox = document.getElementById("dailyPay");

const list = document.getElementById("list");
const summary = document.getElementById("summary");

// ===== データ =====
let records = JSON.parse(localStorage.getItem("records")) || {};

// ===== 保存・修正 =====
function saveDay() {
  const date = dateInput.value;
  if (!date) return alert("日付を選んでね");

  const hourly = +hourlyInput.value || 0;
  const hours = +hoursInput.value || 0;
  const drink = +drinkInput.value || 0;
  const inNomi = +inNomiInput.value || 0;
  const mainNomi = +mainNomiInput.value || 0;
  const douhanSales = +douhanSalesInput.value || 0;

  const base = hourly * hours;
  const back =
    drink * RULE.drinkBack +
    inNomi * RULE.inBack +
    mainNomi * RULE.mainBack +
    douhanSales * RULE.douhanRate;

  const gross = base + back;
  const tax = Math.floor(gross * RULE.taxRate);

  let deduction = 0;
  if (hairCheckbox.checked) deduction += RULE.hair;
  if (welfareCheckbox.checked) deduction += RULE.welfare;
  if (dailyPayCheckbox.checked) deduction += RULE.dailyPay;

  const net = gross - tax - deduction;

  records[date] = {
    date, hourly, hours, drink, inNomi, mainNomi, douhanSales,
    base, back, gross, tax, deduction, net,
    hair: hairCheckbox.checked,
    welfare: welfareCheckbox.checked,
    dailyPay: dailyPayCheckbox.checked
  };

  localStorage.setItem("records", JSON.stringify(records));
  render();
}

// ===== 削除 =====
function deleteDay() {
  const date = dateInput.value;
  if (!date || !records[date]) return;
  if (!confirm("この日のデータを削除しますか？")) return;

  delete records[date];
  localStorage.setItem("records", JSON.stringify(records));
  render();
}

// ===== 編集 =====
function editDay(date) {
  const r = records[date];
  dateInput.value = r.date;
  hourlyInput.value = r.hourly;
  hoursInput.value = r.hours;
  drinkInput.value = r.drink;
  inNomiInput.value = r.inNomi;
  mainNomiInput.value = r.mainNomi;
  douhanSalesInput.value = r.douhanSales;
  hairCheckbox.checked = r.hair;
  welfareCheckbox.checked = r.welfare;
  dailyPayCheckbox.checked = r.dailyPay;
}

// ===== 表示・集計 =====
function render() {
  list.innerHTML = "";
  summary.innerHTML = "";

  let totalHours = 0;
  let totalDrink = 0;
  let totalIn = 0;
  let totalMain = 0;
  let totalDouhan = 0;
  let totalTax = 0;
  let totalDeduction = 0;
  let totalNet = 0;

  Object.keys(records).sort().forEach(date => {
    const r = records[date];

    totalHours += r.hours;
    totalDrink += r.drink * RULE.drinkBack;
    totalIn += r.inNomi * RULE.inBack;
    totalMain += r.mainNomi * RULE.mainBack;
    totalDouhan += r.douhanSales * RULE.douhanRate;
    totalTax += r.tax;
    totalDeduction += r.deduction;
    totalNet += r.net;

    list.innerHTML += `
      <div onclick="editDay('${date}')" style="cursor:pointer;">
        ${date} ：¥${r.net.toLocaleString()}
      </div>
    `;
  });

  summary.innerHTML = `
    総労働時間：${totalHours} 時間<br>
    ドリンクバック合計：¥${totalDrink.toLocaleString()}<br>
    場内指名バック合計：¥${totalIn.toLocaleString()}<br>
    本指名バック合計：¥${totalMain.toLocaleString()}<br>
    同伴バック合計：¥${totalDouhan.toLocaleString()}<br><br>

    税金合計：¥${totalTax.toLocaleString()}<br>
    控除合計：¥${totalDeduction.toLocaleString()}<br><br>

    <strong>✨ 今月の手取り：¥${totalNet.toLocaleString()}</strong>
  `;
}

// 初期表示
render();
