# System Architecture Diagram

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         __root.tsx                              │
│                      <ChatProvider>                             │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    Chat Context                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ State:                                              │ │ │
│  │  │  • chats: Chat[]                                    │ │ │
│  │  │  • currentChat: Chat | null                         │ │ │
│  │  │  • loading: boolean                                 │ │ │
│  │  │  • error: string | null                             │ │ │
│  │  │                                                      │ │ │
│  │  │ Actions:                                            │ │ │
│  │  │  • loadChats()                                      │ │ │
│  │  │  • createChat()                                     │ │ │
│  │  │  • selectChat(id)                                   │ │ │
│  │  │  • addMessage(message)                              │ │ │
│  │  │  • updateChatTitle(id, title)                       │ │ │
│  │  │  • deleteChat(id)                                   │ │ │
│  │  │  • refreshChats()                                   │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │                  Routes                             │ │ │
│  │  │                                                      │ │ │
│  │  │  /chat ──────────────────────────────────────────┐  │ │ │
│  │  │  │                                                │  │ │ │
│  │  │  │  ┌──────────────────────────────────────────┐ │  │ │ │
│  │  │  │  │         MainLayout                       │ │  │ │ │
│  │  │  │  │                                          │ │  │ │ │
│  │  │  │  │  ┌────────────┐  ┌──────────────────┐  │ │  │ │ │
│  │  │  │  │  │  Sidebar   │  │   Chat Content   │  │ │  │ │ │
│  │  │  │  │  │            │  │                  │  │ │  │ │ │
│  │  │  │  │  │ • Logo     │  │ • ChatLayout     │  │ │  │ │ │
│  │  │  │  │  │ • New Chat │  │ • Messages       │  │ │  │ │ │
│  │  │  │  │  │ • Search   │  │ • Input          │  │ │  │ │ │
│  │  │  │  │  │ • Groups:  │  │                  │  │ │  │ │ │
│  │  │  │  │  │   - Today  │  │                  │  │ │  │ │ │
│  │  │  │  │  │   - Yester │  │                  │  │ │  │ │ │
│  │  │  │  │  │   - 7 Days │  │                  │  │ │  │ │ │
│  │  │  │  │  │   - Older  │  │                  │  │ │  │ │ │
│  │  │  │  │  │ • Edit/Del │  │                  │  │ │  │ │ │
│  │  │  │  │  └────────────┘  └──────────────────┘  │ │  │ │ │
│  │  │  │  └──────────────────────────────────────────┘ │  │ │ │
│  │  │  └────────────────────────────────────────────────┘  │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Creating New Chat
```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  Sidebar     │────▶│ Context  │────▶│ Backend  │
│ clicks   │     │ "New Chat"   │     │ create   │     │ POST     │
│ button   │     │              │     │ Chat()   │     │ /chats   │
└──────────┘     └──────────────┘     └──────────┘     └──────────┘
                                             │                │
                                             │                │
                                             ▼                ▼
                                       ┌──────────┐     ┌──────────┐
                                       │ Update   │◀────│ MongoDB  │
                                       │ State    │     │ Insert   │
                                       └──────────┘     └──────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ Sidebar  │
                                       │ Updates  │
                                       └──────────┘
```

### Sending First Message
```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  ChatLayout  │────▶│ Context  │────▶│ Backend  │
│ types &  │     │ send()       │     │ add      │     │ POST     │
│ submits  │     │              │     │ Message  │     │ /chat    │
└──────────┘     └──────────────┘     └──────────┘     └──────────┘
                                             │                │
                                             │                │
                                             ▼                ▼
                                       ┌──────────┐     ┌──────────┐
                                       │ Optimis  │     │ RAG      │
                                       │ tic UI   │     │ Pipeline │
                                       └──────────┘     └──────────┘
                                             │                │
                                             │                ▼
                                             │          ┌──────────┐
                                             │          │ Auto     │
                                             │          │ Generate │
                                             │          │ Title    │
                                             │          └──────────┘
                                             │                │
                                             │                ▼
                                             │          ┌──────────┐
                                             │◀─────────│ MongoDB  │
                                             │          │ Save     │
                                             ▼          └──────────┘
                                       ┌──────────┐
                                       │ Refresh  │
                                       │ Chats    │
                                       └──────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ Title    │
                                       │ Updates  │
                                       │ Sidebar  │
                                       └──────────┘
```

### Switching Chats
```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  Sidebar     │────▶│ Context  │────▶│ Backend  │
│ clicks   │     │ chat item    │     │ select   │     │ GET      │
│ chat     │     │              │     │ Chat(id) │     │/chats/:id│
└──────────┘     └──────────────┘     └──────────┘     └──────────┘
                                             │                │
                                             │                ▼
                                             │          ┌──────────┐
                                             │          │ MongoDB  │
                                             │          │ Find     │
                                             │          └──────────┘
                                             │                │
                                             │                ▼
                                             │          ┌──────────┐
                                             │◀─────────│ Return   │
                                             │          │ Messages │
                                             ▼          └──────────┘
                                       ┌──────────┐
                                       │ Set      │
                                       │ Current  │
                                       │ Chat     │
                                       └──────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ Messages │
                                       │ Display  │
                                       └──────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ Sidebar  │
                                       │ Closes   │
                                       │ (mobile) │
                                       └──────────┘
```

### Renaming Chat
```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  Sidebar     │────▶│ Context  │────▶│ Backend  │
│ clicks   │     │ edit icon    │     │ update   │     │ PATCH    │
│ edit     │     │              │     │ Title()  │     │/chats/:id│
└──────────┘     └──────────────┘     └──────────┘     │/title    │
      │                                      │          └──────────┘
      │                                      │                │
      ▼                                      │                ▼
┌──────────┐                                 │          ┌──────────┐
│ Inline   │                                 │          │ MongoDB  │
│ Input    │                                 │          │ Update   │
│ Appears  │                                 │          └──────────┘
└──────────┘                                 │                │
      │                                      │                │
      │ User types                           │                │
      │ & presses Enter                      │                │
      │                                      │                │
      └──────────────────────────────────────┘                │
                                             │                │
                                             │◀───────────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ Update   │
                                       │ Local    │
                                       │ State    │
                                       └──────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ Sidebar  │
                                       │ Shows    │
                                       │ New Name │
                                       └──────────┘
```

### Deleting Chat
```
┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│  User    │────▶│  Sidebar     │────▶│ Confirm  │────▶│ Context  │
│ clicks   │     │ delete icon  │     │ Dialog   │     │ delete   │
│ delete   │     │              │     │          │     │ Chat(id) │
└──────────┘     └──────────────┘     └──────────┘     └──────────┘
                                             │                │
                                             │ User confirms  │
                                             │                ▼
                                             │          ┌──────────┐
                                             │          │ Backend  │
                                             │          │ DELETE   │
                                             │          │/chats/:id│
                                             │          └──────────┘
                                             │                │
                                             │                ▼
                                             │          ┌──────────┐
                                             │          │ MongoDB  │
                                             │          │ Remove   │
                                             │          └──────────┘
                                             │                │
                                             │◀───────────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ Remove   │
                                       │ from     │
                                       │ State    │
                                       └──────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ If       │
                                       │ Active?  │
                                       └──────────┘
                                          │    │
                                    Yes   │    │ No
                                          │    │
                                          ▼    ▼
                                    ┌──────────┐
                                    │ Create   │
                                    │ New Chat │
                                    └──────────┘
                                          │
                                          ▼
                                    ┌──────────┐
                                    │ Sidebar  │
                                    │ Updates  │
                                    └──────────┘
```

### Search Flow
```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  User    │────▶│  Sidebar     │────▶│ Filter   │
│ types in │     │ search input │     │ Logic    │
│ search   │     │              │     │          │
└──────────┘     └──────────────┘     └──────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ useMemo  │
                                       │ filters  │
                                       │ chats    │
                                       └──────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ Re-group │
                                       │ filtered │
                                       │ results  │
                                       └──────────┘
                                             │
                                             ▼
                                       ┌──────────┐
                                       │ Display  │
                                       │ matches  │
                                       └──────────┘
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      ChatContext                            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                    State                              │ │
│  │                                                       │ │
│  │  chats: [                                            │ │
│  │    {                                                 │ │
│  │      id: "uuid-1",                                   │ │
│  │      title: "Contract review",                       │ │
│  │      messages: [...],                                │ │
│  │      createdAt: "2024-...",                          │ │
│  │      updatedAt: "2024-...",                          │ │
│  │      messageCount: 5                                 │ │
│  │    },                                                │ │
│  │    { ... }                                           │ │
│  │  ]                                                   │ │
│  │                                                       │ │
│  │  currentChat: {                                      │ │
│  │    id: "uuid-1",                                     │ │
│  │    title: "Contract review",                         │ │
│  │    messages: [                                       │ │
│  │      { role: "user", content: "...", ... },         │ │
│  │      { role: "assistant", content: "...", ... }     │ │
│  │    ],                                                │ │
│  │    ...                                               │ │
│  │  }                                                   │ │
│  │                                                       │ │
│  │  loading: false                                      │ │
│  │  error: null                                         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   Actions                             │ │
│  │                                                       │ │
│  │  loadChats() ──────────▶ GET /chats ──────▶ MongoDB │ │
│  │  createChat() ─────────▶ POST /chats ─────▶ MongoDB │ │
│  │  selectChat(id) ───────▶ GET /chats/:id ──▶ MongoDB │ │
│  │  updateChatTitle() ────▶ PATCH /chats/:id ▶ MongoDB │ │
│  │  deleteChat(id) ───────▶ DELETE /chats/:id ▶ MongoDB │ │
│  │  addMessage() ─────────▶ Local state update          │ │
│  │  refreshChats() ───────▶ GET /chats ──────▶ MongoDB │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Provides state & actions
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │         All Components               │
        │                                      │
        │  • Sidebar                           │
        │  • ChatLayout                        │
        │  • MainLayout                        │
        │  • Any route                         │
        └──────────────────────────────────────┘
```

## MongoDB Schema

```
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                         │
│                      "lexiai"                               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Collection: "chats"                      │ │
│  │                                                       │ │
│  │  Document 1:                                         │ │
│  │  {                                                   │ │
│  │    _id: ObjectId("..."),                            │ │
│  │    session_id: "uuid-string",                       │ │
│  │    user_id: "default_user",                         │ │
│  │    title: "Contract review",                        │ │
│  │    messages: [                                      │ │
│  │      {                                              │ │
│  │        role: "user",                                │ │
│  │        content: "What is clause 5?",                │ │
│  │        timestamp: ISODate("2024-...")               │ │
│  │      },                                             │ │
│  │      {                                              │ │
│  │        role: "assistant",                           │ │
│  │        content: "Clause 5 states...",               │ │
│  │        timestamp: ISODate("2024-...")               │ │
│  │      }                                              │ │
│  │    ],                                               │ │
│  │    created_at: ISODate("2024-..."),                 │ │
│  │    updated_at: ISODate("2024-...")                  │ │
│  │  }                                                  │ │
│  │                                                       │ │
│  │  Document 2: { ... }                                │ │
│  │  Document 3: { ... }                                │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Collection: "documents"                     │ │
│  │  (for uploaded files metadata)                       │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                          │
│                  http://localhost:8000                      │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                Chat Management                        │ │
│  │                                                       │ │
│  │  POST   /chats                                       │ │
│  │  ├─ Body: { user_id: string }                       │ │
│  │  └─ Returns: { session_id, title, created_at }      │ │
│  │                                                       │ │
│  │  GET    /chats?user_id=default_user                 │ │
│  │  └─ Returns: { chats: [...], total: number }        │ │
│  │                                                       │ │
│  │  GET    /chats/:session_id                          │ │
│  │  └─ Returns: { session_id, title, messages, ... }   │ │
│  │                                                       │ │
│  │  PATCH  /chats/:session_id/title                    │ │
│  │  ├─ Body: { title: string }                         │ │
│  │  └─ Returns: { message: "Title updated" }           │ │
│  │                                                       │ │
│  │  DELETE /chats/:session_id                          │ │
│  │  └─ Returns: { message: "Chat deleted" }            │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                  Messaging                            │ │
│  │                                                       │ │
│  │  POST   /chat                                        │ │
│  │  ├─ Body: { question: string, session_id: string }  │ │
│  │  └─ Returns: { answer, sources, session_id }        │ │
│  │  └─ Side effect: Auto-generates title on first msg  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Document Upload                          │ │
│  │                                                       │ │
│  │  POST   /upload                                      │ │
│  │  ├─ Body: FormData with files                       │ │
│  │  └─ Returns: { session_id, files: [...] }           │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Props Flow

```
__root.tsx
  └─ <ChatProvider>
       │
       ├─ Provides: useChatContext()
       │
       └─ /chat route
            │
            └─ <MainLayout
                 activeChatId={sessionId}
                 onNewChat={handleCreateNewChat}
                 onSelectChat={handleSelectChat}
                 onDeleteChat={handleDeleteChat}
                 onRenameChat={handleRenameChat}
               >
                 │
                 ├─ <Sidebar
                 │    open={open}
                 │    onClose={onClose}
                 │    chats={chats}
                 │    docs={docs}
                 │    activeChatId={activeChatId}
                 │    onNewChat={onNewChat}
                 │    onSelectChat={onSelectChat}
                 │    onDeleteChat={onDeleteChat}
                 │    onRenameChat={onRenameChat}
                 │  />
                 │
                 └─ <ChatLayout
                      messages={messages}
                      loading={loading}
                      onSend={send}
                      onRegenerate={regenerate}
                    />
```

## Time-based Grouping Logic

```
Current Time: 2024-05-12 14:30:00

┌─────────────────────────────────────────────────────────────┐
│                    Chat Grouping                            │
│                                                             │
│  Today (2024-05-12 00:00:00 onwards)                       │
│  ├─ Chat created at 2024-05-12 14:00:00 ✓                  │
│  ├─ Chat created at 2024-05-12 09:30:00 ✓                  │
│  └─ Chat created at 2024-05-12 00:15:00 ✓                  │
│                                                             │
│  Yesterday (2024-05-11 00:00:00 to 2024-05-11 23:59:59)    │
│  ├─ Chat created at 2024-05-11 18:00:00 ✓                  │
│  └─ Chat created at 2024-05-11 10:00:00 ✓                  │
│                                                             │
│  Previous 7 Days (2024-05-05 to 2024-05-10)                │
│  ├─ Chat created at 2024-05-10 12:00:00 ✓                  │
│  ├─ Chat created at 2024-05-08 15:00:00 ✓                  │
│  └─ Chat created at 2024-05-06 09:00:00 ✓                  │
│                                                             │
│  Older (before 2024-05-05)                                 │
│  ├─ Chat created at 2024-05-01 10:00:00 ✓                  │
│  ├─ Chat created at 2024-04-28 14:00:00 ✓                  │
│  └─ Chat created at 2024-03-15 11:00:00 ✓                  │
└─────────────────────────────────────────────────────────────┘
```

This diagram shows the complete system architecture and data flow for the dynamic chat system!
