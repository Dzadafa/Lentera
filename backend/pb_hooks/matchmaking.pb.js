/**
 * PocketBase server-side hooks untuk matchmaking chat psikolog
 * pb_hooks/matchmaking.pb.js
 */

routerAdd("POST", "/api/chat/match-random", (c) => {
  const data = $apis.requestInfo(c).data;
  const anonymousUserId = data.anonymous_user_id || "anon_" + $security.randomString(8);

  const dao = $app.dao();

  // 1. Cari psikolog yang KYC-nya verified dan sedang online
  const psychologists = dao.findRecordsByFilter(
    "psychologists",
    "kyc_status = 'verified' && is_online = true",
    "-updated",
    20,
    0
  );

  if (!psychologists || psychologists.length === 0) {
    return c.json(404, {
      message: "Saat ini belum ada konselor psikologi yang sedang online. Silakan coba sesaat lagi atau gunakan Hotline 119.",
      status: "no_counselor_available"
    });
  }

  // Pilih 1 konselor secara acak (random match)
  const randomIndex = Math.floor(Math.random() * psychologists.length);
  const matchedPsychologist = psychologists[randomIndex];

  // 2. Buat chat session baru
  const chatSessionsCollection = dao.findCollectionByNameOrId("chat_sessions");
  const sessionRecord = new Record(chatSessionsCollection, {
    anonymous_user_id: anonymousUserId,
    psychologist: matchedPsychologist.id,
    status: "active",
    started_at: new Date().toISOString()
  });

  dao.saveRecord(sessionRecord);

  // 3. Tambahkan pesan sambutan awal dari konselor
  const chatMessagesCollection = dao.findCollectionByNameOrId("chat_messages");
  const welcomeMsg = new Record(chatMessagesCollection, {
    session: sessionRecord.id,
    sender: "psychologist",
    text: "Halo! Saya " + matchedPsychologist.getString("name") + " dari " + matchedPsychologist.getString("university") + ". Ruang ini aman dan 100% rahasia. Apa yang sedang kamu rasakan atau ingin kamu ceritakan hari ini?"
  });
  dao.saveRecord(welcomeMsg);

  return c.json(200, {
    session_id: sessionRecord.id,
    anonymous_user_id: anonymousUserId,
    psychologist: {
      id: matchedPsychologist.id,
      name: matchedPsychologist.getString("name"),
      university: matchedPsychologist.getString("university"),
      bio: matchedPsychologist.getString("bio"),
      kyc_status: matchedPsychologist.getString("kyc_status")
    }
  });
});

// Endpoint untuk SKIP / Ganti Konselor Lain
routerAdd("POST", "/api/chat/skip-counselor", (c) => {
  const data = $apis.requestInfo(c).data;
  const sessionId = data.session_id;

  const dao = $app.dao();
  const session = dao.findRecordById("chat_sessions", sessionId);

  if (!session) {
    return c.json(404, { message: "Sesi obrolan tidak ditemukan." });
  }

  // Akhiri sesi lama sebagai 'skipped'
  session.set("status", "skipped");
  session.set("ended_at", new Date().toISOString());
  dao.saveRecord(session);

  // Bebaskan psikolog lama
  const prevPsychId = session.getString("psychologist");
  if (prevPsychId) {
    try {
      const prevPsych = dao.findRecordById("psychologists", prevPsychId);
      if (prevPsych) {
        prevPsych.set("is_busy", false);
        dao.saveRecord(prevPsych);
      }
    } catch (e) {
      // ignore
    }
  }

  return c.json(200, { message: "Sesi konselor telah dilewati." });
});
