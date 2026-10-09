import { db } from "./db.js";

const QIDS = { area: "2", name: "3", supply: "4", quantity: "5", note: "6" };

function isConfigured() {
  return Boolean(process.env.JOTFORM_API_KEY && process.env.JOTFORM_FORM_ID);
}

function answerFor(answers, qid) {
  const entry = answers?.[qid];
  if (!entry) return "";
  return String(entry.answer ?? entry.text ?? "").trim();
}

export async function syncJotformRequests() {
  if (!isConfigured()) {
    return { synced: 0, skipped: true, reason: "JotForm no está configurado (faltan JOTFORM_API_KEY / JOTFORM_FORM_ID)" };
  }

  const url = new URL(`https://api.jotform.com/form/${process.env.JOTFORM_FORM_ID}/submissions`);
  url.searchParams.set("apiKey", process.env.JOTFORM_API_KEY);
  url.searchParams.set("limit", "1000");
  url.searchParams.set("orderby", "created_at");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`JotForm API respondió ${res.status}`);
  }
  const json = await res.json();
  const submissions = json.content ?? [];

  const supplies = db.prepare("SELECT id, name FROM supplies").all();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO requests
       (jotform_submission_id, area, requester_name, supply_id, supply_name_raw, quantity, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let synced = 0;
  const tx = db.transaction((rows) => {
    for (const submission of rows) {
      const answers = submission.answers ?? {};
      const area = answerFor(answers, QIDS.area);
      const requesterName = answerFor(answers, QIDS.name);
      const supplyRaw = answerFor(answers, QIDS.supply);
      const quantity = Number(answerFor(answers, QIDS.quantity)) || 0;
      const note = answerFor(answers, QIDS.note) || null;
      const match = supplies.find((s) => s.name === supplyRaw);

      const result = insert.run(
        submission.id,
        area,
        requesterName,
        match ? match.id : null,
        supplyRaw,
        quantity,
        note,
        submission.created_at
      );
      if (result.changes > 0) synced++;
    }
  });
  tx(submissions);

  return { synced, total: submissions.length };
}
