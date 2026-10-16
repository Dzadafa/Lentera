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

// Endpoint untuk Berbagi Cerita Anonim ke Dinding Cerita
routerAdd("POST", "/api/stories/share", (c) => {
  const data = $apis.requestInfo(c).data;
  const storyText = (data.story || "").trim();
  const quoteText = (data.quote || "").trim();
  const actionTaken = (data.action_taken || "").trim();
  const nowStatus = (data.now_status || "").trim();
  const fromTier = data.from_tier === "high" ? "high" : "moderate";

  if (!storyText) {
    return c.json(400, { message: "Isi cerita tidak boleh kosong." });
  }

  const dao = $app.dao();
  const storiesCollection = dao.findCollectionByNameOrId("stories");
  if (!storiesCollection) {
    return c.json(500, { message: "Koleksi stories tidak ditemukan." });
  }

  const newStory = new Record(storiesCollection, {
    author_label: "Pengguna Lentera",
    from_tier: fromTier,
    quote: quoteText || (storyText.length > 80 ? storyText.substring(0, 80) + "..." : storyText),
    story: storyText,
    action_taken: actionTaken || "Mengambil jeda dan berbagi cerita",
    now_status: nowStatus || "Sedang berproses menjadi lebih baik",
    is_approved: true
  });

  dao.saveRecord(newStory);

  return c.json(200, {
    message: "Cerita berhasil dibagikan ke Dinding Cerita!",
    story: {
      id: newStory.id,
      author_label: newStory.getString("author_label"),
      from_tier: newStory.getString("from_tier"),
      quote: newStory.getString("quote"),
      story: newStory.getString("story"),
      action_taken: newStory.getString("action_taken"),
      now_status: newStory.getString("now_status"),
      created: newStory.getString("created")
    }
  });
});// Endpoint untuk Mengirim Pesan Chat (Aman dari kendala relasi collectionId kosong)
routerAdd("POST", "/api/chat/send-message", (c) => {
  const data = $apis.requestInfo(c).data;
  const sessionId = (data.session_id || data.session || "").trim();
  const sender = (data.sender || "user").trim();
  const text = (data.text || "").trim();

  if (!sessionId) {
    return c.json(400, { message: "ID Sesi (session_id) tidak boleh kosong." });
  }

  if (!text) {
    return c.json(400, { message: "Isi pesan tidak boleh kosong." });
  }

  const dao = $app.dao();
  const session = dao.findRecordById("chat_sessions", sessionId);
  if (!session) {
    return c.json(404, { message: "Sesi obrolan tidak ditemukan." });
  }

  if (session.getString("status") === "skipped" || session.getString("status") === "ended") {
    return c.json(403, { message: "Sesi ini telah diarsipkan atau dilewati." });
  }

  const chatMessagesCollection = dao.findCollectionByNameOrId("chat_messages");
  const msgRecord = new Record(chatMessagesCollection, {
    session: session.id,
    sender: sender === "psychologist" ? "psychologist" : "user",
    text: text
  });

  dao.saveRecord(msgRecord);

  return c.json(200, {
    id: msgRecord.id,
    session: session.id,
    sender: msgRecord.getString("sender"),
    text: msgRecord.getString("text"),
    created: msgRecord.getString("created")
  });
});
