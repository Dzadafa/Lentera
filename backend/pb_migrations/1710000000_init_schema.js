// pb_migrations/1710000000_init_schema.js
migrate((db) => {
  // 1. Koleksi Psychologists (KYC & Data Konselor)
  const psychologists = new Collection({
    name: "psychologists",
    type: "base",
    schema: [
      {
        name: "name",
        type: "text",
        required: true,
        options: { min: 2, max: 100 }
      },
      {
        name: "email",
        type: "email",
        required: true,
        unique: true
      },
      {
        name: "university",
        type: "text",
        required: true,
        options: { min: 2, max: 100 }
      },
      {
        name: "student_id",
        type: "text",
        required: true,
        options: { max: 50 }
      },
      {
        name: "bio",
        type: "text",
        required: false,
        options: { max: 500 }
      },
      {
        name: "kyc_status",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["pending", "verified", "rejected"]
        }
      },
      {
        name: "kyc_document",
        type: "file",
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png", "application/pdf"]
        }
      },
      {
        name: "is_online",
        type: "bool",
        required: false
      },
      {
        name: "is_busy",
        type: "bool",
        required: false
      }
    ],
    listRule: "@request.auth.id != '' || kyc_status = 'verified'",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null
  });

  // 2. Koleksi Chat Sessions (Sesi Chat 1-on-1 dengan Matchmaking & Skip)
  const chatSessions = new Collection({
    name: "chat_sessions",
    type: "base",
    schema: [
      {
        name: "anonymous_user_id",
        type: "text",
        required: true,
        options: { max: 100 }
      },
      {
        name: "psychologist",
        type: "relation",
        required: false,
        options: {
          collectionId: "", // Diisi otomatis saat create
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: "status",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["waiting", "active", "skipped", "ended"]
        }
      },
      {
        name: "started_at",
        type: "date",
        required: false
      },
      {
        name: "ended_at",
        type: "date",
        required: false
      }
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: null
  });

  // 3. Koleksi Chat Messages (Realtime Pesan Obrolan)
  const chatMessages = new Collection({
    name: "chat_messages",
    type: "base",
    schema: [
      {
        name: "session",
        type: "relation",
        required: true,
        options: {
          cascadeDelete: true,
          maxSelect: 1
        }
      },
      {
        name: "sender",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["user", "psychologist"]
        }
      },
      {
        name: "text",
        type: "text",
        required: true,
        options: { min: 1, max: 2000 }
      }
    ],
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: null,
    deleteRule: null
  });

  // 4. Koleksi Stories (Dinding Cerita Anonim dari Server)
  const stories = new Collection({
    name: "stories",
    type: "base",
    schema: [
      {
        name: "author_label",
        type: "text",
        required: true,
        options: { max: 100 }
      },
      {
        name: "from_tier",
        type: "select",
        required: true,
        options: {
          maxSelect: 1,
          values: ["moderate", "high"]
        }
      },
      {
        name: "quote",
        type: "text",
        required: true,
        options: { max: 300 }
      },
      {
        name: "story",
        type: "text",
        required: true,
        options: { max: 3000 }
      },
      {
        name: "action_taken",
        type: "text",
        required: true,
        options: { max: 300 }
      },
      {
        name: "now_status",
        type: "text",
        required: true,
        options: { max: 200 }
      },
      {
        name: "tags",
        type: "json",
        required: false
      },
      {
        name: "is_approved",
        type: "bool",
        required: false
      }
    ],
    listRule: "is_approved = true",
    viewRule: "is_approved = true",
    createRule: "",
    updateRule: null,
    deleteRule: null
  });

  Dao(db).saveCollection(psychologists);
  Dao(db).saveCollection(chatSessions);
  Dao(db).saveCollection(chatMessages);
  Dao(db).saveCollection(stories);
}, (db) => {
  const psychologists = Dao(db).findCollectionByNameOrId("psychologists");
  const chatSessions = Dao(db).findCollectionByNameOrId("chat_sessions");
  const chatMessages = Dao(db).findCollectionByNameOrId("chat_messages");
  const stories = Dao(db).findCollectionByNameOrId("stories");

  if (psychologists) Dao(db).deleteCollection(psychologists);
  if (chatSessions) Dao(db).deleteCollection(chatSessions);
  if (chatMessages) Dao(db).deleteCollection(chatMessages);
  if (stories) Dao(db).deleteCollection(stories);
});
