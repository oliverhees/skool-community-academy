# n8n AI Agent Prompts optimal gestalten

**n8n hat seine AI-Agent-Architektur drastisch vereinfacht und nutzt hauptsächlich den Tools Agent mit dem System Message als zentralem Prompt-Engineering-Tool.** Die wichtigsten Erkenntnisse: Klare Rollendefiniton, explizite Tool-Anweisungen und Context Engineering (nicht nur Prompt Engineering) sind entscheidend. Die Plattform ermöglicht durch LangChain-Integration ausgefeilte Memory-Verwaltung, wobei Postgres/Redis für Production und Window Buffer Memory für Tests empfohlen werden. Variable Handling erfolgt über `{{ $json.variable }}`-Expressions, während die `$fromAI()`-Funktion dynamische Parameter-Befüllung ermöglicht.

## Aktuelle Agent-Typen und deren Prompt-Anforderungen

**n8n hat seit Version 1.82.0 eine fundamentale Vereinfachung vorgenommen.** Ursprünglich existierten mehrere Agent-Typen (Conversational Agent, ReAct Agent, OpenAI Functions Agent), doch ab Februar 2025 wurde die Architektur konsolidiert. Der **Tools Agent** ist nun der Standard und Default für alle Implementierungen. Diese Vereinheitlichung bringt erhebliche Vorteile: verbesserte Tool-Calling-Fähigkeiten, standardisierte Output-Formate und eine zuverlässigere LangChain-basierte Tool-Interface-Implementierung.

Der Tools Agent unterstützt mehrere Chat-Modelle (OpenAI, Groq, Mistral, Anthropic, Azure OpenAI) und ist kompatibel mit Chat Trigger Nodes inklusive Memory Sub-Nodes. Die älteren Agent-Typen wurden bewusst entfernt, da der Tools Agent deren Funktionalität mit höherer Zuverlässigkeit abdeckt. Workflows, die auf "Tools Agent" konfiguriert waren, funktionieren mit der aktualisierten Node-Version weiterhin.

**Plan and Execute Agent** und **OpenAI Functions Agent** sind noch dokumentiert, werden aber deutlich seltener eingesetzt. Der ReAct Agent, der explizit Chain-of-Thought-Reasoning implementierte, wurde vollständig entfernt – seine Limitation war das fehlende Memory-Support.

## Optimaler Aufbau von n8n Agent Prompts

Die Prompt-Struktur in n8n folgt einer klaren Hierarchie mit **zwei Hauptkomponenten**: System Message (definiert Verhalten) und User Prompt (enthält Anfrage). Diese Trennung ist fundamental für effektive Agents.

### System Message: Das Herzstück

Die System Message wird vor Konversationsbeginn gesendet und steuert alle Agent-Entscheidungen. Sie befindet sich unter "Options" → "Add Option" → "System Message" im AI Agent Node. Der Standardwert "You are a helpful assistant" sollte immer angepasst werden.

**Struktur einer effektiven System Message:**

```
Du bist ein [spezifische Rolle] der [Hauptfunktion].

Deine Aufgabe:
1. [Erster Schritt im Workflow]
2. [Zweiter Schritt]
3. [Dritter Schritt]

Verfügbare Tools:
- tool_name: [Beschreibung wann und wie nutzen]
- tool_name: [Beschreibung]

Wichtige Einschränkungen:
- [Was der Agent tun MUSS]
- [Was der Agent NICHT tun soll]

Bei Problemen:
- [Fallback-Verhalten definieren]
```

**Konkretes Beispiel (Research Agent):**

```
Du bist ein intelligenter Research-Assistent. Deine Aufgabe:

1. Nutze das website_scraper Tool um die bereitgestellte URL zu scrapen
2. Extrahiere Hauptinhalt, Titel und Schlüsselinformationen
3. Generiere eine prägnante Zusammenfassung der Erkenntnisse
4. Speichere die Recherche in Notion mit korrekter Formatierung
5. Sende eine Discord-Benachrichtigung bei Abschluss

Wichtige Einschränkungen:
- Du MUSST immer zuerst das website_scraper Tool verwenden
- Versuche NICHT ohne Scraping zusammenzufassen!
- Füge immer die Original-URL in deine Notion-Page ein
- Wähle ein passendes Emoji-Icon basierend auf dem Inhalt

Workflow:
- Nutze website_scraper Tool zuerst für Content
- Verarbeite und analysiere den gescrapten Inhalt
- Nutze save_to_notion um Informationen zu speichern
- Abschließend discord_notification mit Link zur Notion-Page
```

### User Prompt Konfiguration

Der User Prompt hat zwei Optionen:

**1. "Take from previous node automatically"**: Erwartet Input von einem Node namens `chatInput`. Automatische Integration mit Chat Trigger, keine manuelle Expression nötig.

**2. "Define below"**: Ermöglicht custom Expressions oder statischen Text. Referenziert beliebige Node-Daten wie `{{ $json.userQuery }}` oder `Erzähle mir über {{ $json.topic }}`.

### Die 11 essenziellen Prompting-Prinzipien

Die n8n Community hat durch umfangreiche Tests **11 Kernprinzipien** identifiziert:

**1. Memory für Fortschritts-Tracking hinzufügen** – Simple Memory Node mit 5-10 Messages bietet beste Balance. Konfiguriere Session Keys um separate Conversations pro User zu maintainen.

**2. Loops für komplexe Prozesse nutzen** – Bei komplexen Workflows Work in Plan, Do, Review Loops aufteilen statt einen Agent alles machen zu lassen.

**3. Tool-Usage-Patterns explizit vorschlagen** – Standard-Tool-Beschreibungen reichen oft nicht. Klartext: "Nutze zuerst Tool X, dann Tool Y".

**4. Agent-Rolle klar definieren** – Spezifische Rolle upfront: "Du bist ein Customer Support Agent der Produktfragen beantwortet".

**5. Tool-Nutzung explizit anweisen** – WANN und WIE jedes Tool zu nutzen ist. Beispiel: "Denke daran: Du musst IMMER zuerst die Website mit website_scraper scrapen!"

**6. Wichtige Constraints hinzufügen** – Explizite Grenzen setzen: "Sende IMMER den Link zum Bild in der finalen Antwort".

**7. Beispiele bereitstellen** – Konkrete Examples des erwarteten Verhaltens in System Prompts einbauen.

**8. Konsistente Persönlichkeit etablieren** – Kommunikationsstil definieren: "Sprich den User jedes Mal mit Namen an".

**9. Strukturierten Denkprozess vorgeben** – Reasoning-Ansatz vorgeben: "Denke immer step-by-step welches Tool am passendsten wäre".

**10. Fallback-Verhalten definieren** – Was tun wenn Tasks nicht completebar: "Falls du nicht das richtige Tool hast, erkenne deine Limitations und schlage Alternativen vor".

**11. Context-Aware Instructions** – Expressions für Personalisierung: `Du kommunizierst mit einem User namens {{ $json.message.from.first_name }}`.

## Variablen, Platzhalter und Expression-Handling

n8n nutzt **Expression Syntax mit doppelten geschweiften Klammern**: `{{ expression }}`. Das Variable Handling unterscheidet mehrere Core-Typen:

### Basis-Variablen-Typen

**$json** – Zugriff auf eingehende JSON-Daten vom Previous Node:
```javascript
{{ $json.fieldName }}
{{ $json['nested']['property'] }}
{{ $json.data.toJsonString() }}  // Objekte zu Strings konvertieren
```

**$input** – Referenziert Input-Daten:
```javascript
{{ $input.all() }}    // Alle Input Items
{{ $input.first() }}  // Erstes Input Item
{{ $input.last() }}   // Letztes Input Item
```

**$node[]** – Referenziert spezifische Node Outputs:
```javascript
{{ $node['Node Name'].json.data }}
// Erforderlich für nicht-direkt-verbundene Nodes
```

**$fromAI()** – Dynamische AI-powered Parameter-Befüllung (nur Tools Agent):
```javascript
{{ $fromAI('key', 'description', 'type', defaultValue) }}
```

### Critical: Expression Mode aktivieren

**Für System Messages und User Prompts MUSS Expression Mode aktiviert werden.** Klicke auf den "Expression" Toggle im Parameter-Feld. Objekte müssen zu Strings konvertiert werden mit `.toJsonString()` oder `JSON.stringify()`.

**Korrekte Verwendung in System Message:**
```javascript
// Expression Mode aktiviert!
Du bist ein {{ $json.role }} Assistant.
Context: {{ $json.context.toJsonString() }}
```

### Dynamischer Prompt-Aufbau

Beispiel aus GitHub Dynamic Prompts Workflow:

**GitHub Prompt-Datei:**
```
Hallo {{ $json.company }}, dein Produkt {{ $json.features }} 
launched am {{ $json.launch_date }}.
```

**SetVars Node Data:**
```json
{
  "company": "PropTechPro",
  "features": "AI-powered Property Management",
  "launch_date": "15. März 2025"
}
```

**Resultat:**
```
Hallo PropTechPro, dein Produkt AI-powered Property Management 
launched am 15. März 2025.
```

### $fromAI() Funktion im Detail

Die `$fromAI()`-Funktion ermöglicht AI-gesteuerte Parameter-Befüllung basierend auf Kontext:

**Syntax:**
```javascript
$fromAI('key', 'description', 'type', defaultValue)
```

**Parameter:**
- **key** (required): Parametername (1-64 Zeichen, alphanumerisch, underscore, hyphen)
- **description** (optional): Kontext für AI
- **type** (optional): 'string', 'number', 'boolean', 'json' (default: 'string')
- **defaultValue** (optional): Fallback-Wert

**Praktische Beispiele:**

```javascript
// Simple Verwendung
{{ $fromAI('name') }}

// Mit vollständigen Parametern
{{ $fromAI('name', 'The customer full name', 'string') }}

// Für Zahlen
{{ $fromAI('quantity', 'Number of items in stock', 'number') }}

// In Notion Tool
{{ $fromAI('title', 'The original title of the article', 'string') }}
{{ $fromAI('tags', 'Relevant tags for categorization', 'json') }}
```

**Wichtig:** $fromAI() funktioniert NUR mit Tools die an AI Agent Nodes connected sind, NICHT mit Code Tool oder anderen Sub-Nodes.

### HTTP Request Tool Placeholder

Für HTTP Request Tools verwenden Placeholders **single curly braces** in JSON Body: `{placeholderName}`.

**Konfigurationsschritte:**

**1. JSON Body mit Placeholders:**
```json
{
  "url": "{url}",
  "gotoOptions": {
    "waitUntil": "networkidle0"
  }
}
```

**2. Placeholder Definition:**
- Klicke "Add Definition"
- **Placeholder Name**: Muss mit JSON-Name übereinstimmen (z.B. `url`)
- **Description**: Klare Beschreibung für AI ("the URL of the website to scrape")
- **Type**: String, Number, Boolean, oder JSON

**Critical:** String-Placeholders in JSON MÜSSEN in Quotes wrapped werden:
```json
{
  "type": "{type}",      // Korrekt für Strings
  "title": "{title}",    // Korrekt
  "count": {count}       // Korrekt für Numbers (keine Quotes)
}
```

### Häufige Fehler vermeiden

**❌ ANTI-PATTERNS:**

```javascript
// 1. Expression Mode nicht aktiviert
Du bist ein {{ $json.role }} assistant.  // Funktioniert nicht in Fixed mode!

// 2. Objekte nicht zu Strings konvertiert
{{ $json.complexObject }}  // Fehler!

// 3. Fehlende Quotes in JSON Placeholders (für Strings)
{"title": {title}}  // FALSCH

// 4. Null Values ohne Fallback
{{ $json.missingField }}  // Gibt null zurück
```

**✅ CORRECT PATTERNS:**

```javascript
// 1. Expression Mode aktiviert
// Wechsle zu Expression mode im Field

// 2. Objekte konvertieren
{{ $json.complexObject.toJsonString() }}

// 3. Quotes für String Placeholders
{"title": "{title}"}  // RICHTIG

// 4. Null Handling
{{ $json.missingField ?? 'default value' }}
```

## Memory und Context Management

Memory-Management in n8n basiert auf **LangChain-Integration** mit mehreren spezialisierten Memory-Optionen. Das Verständnis der Memory-Architektur ist fundamental für production-ready Agents.

### Memory-Typen und ihre Verwendung

**Simple Memory (Window Buffer Memory)**
- Speichert Chat-History für aktuelle Session
- Konfigurierbare Context Window Length (Anzahl gespeicherter Interactions)
- Memory persistiert NICHT zwischen Workflow-Executions
- Ideal für Testing und einfache Chatbot-Implementierungen
- Empfohlen: 5-10 Messages für beste Balance

**Postgres Chat Memory**
- Persistente Datenbank-Speicherung für Chat-History
- Konfiguration: Session Key, Table Name, Context Window Length
- Ermöglicht user-spezifisches Memory über Sessions hinweg
- Production-Ready-Option
- Auto-creates Table falls nicht existent

**Redis Chat Memory**
- Ähnlich wie Postgres, nutzt Redis als Storage Backend
- Schnellere Performance für high-volume Applications
- Context Window Length Parameter verfügbar
- Bekanntes Issue: Parameter funktioniert nicht immer wie erwartet (Bug #12193)

**Critical Limitation:** Multiple Memory Nodes im selben Workflow greifen standardmäßig auf dieselbe Memory-Instanz zu. Nutze unterschiedliche Session IDs für separate Memory-Instanzen.

### Session Management Best Practices

**Session Key Patterns:**

```javascript
// Per-User Conversation
chat_with_{{ $('Trigger').first().json.message.chat.id }}

// Per-Workflow Instance
session_{{ $execution.id }}

// Time-Based Sessions
{{ $now.format('YYYY-MM-DD') }}_{{ $json.user_id }}
```

**Message Structure:** n8n speichert drei Message-Typen:
- **User Messages**: Input vom User
- **AI Messages**: Responses vom AI Agent
- **System Messages**: Instructions für AI

**Critical Bug Alert (April 2025):** AI Agent und Memory Nodes speichern NUR Input/Output Messages, NICHT Tool Messages. Das kann dazu führen, dass Agents "vergessen" welche Tools sie aufgerufen haben, was zu Hallucinations führt (Agent behauptet Action ausgeführt zu haben, hat Tool aber nicht executed).

### Context Window Management

**Conceptual Framework:** LLMs haben ein begrenztes Context Window (gemessen in Tokens) – vergleichbar mit RAM in einem Betriebssystem. Zu viel Kontext führt zu mehreren Problemen:

- **Context Overload**: Zu viel Information overwhelmt das Model
- **Context Pollution**: Irrelevante Daten reduzieren Effectiveness
- **Context Poisoning**: Hallucinations oder falsche Facts im Context werden reproduziert
- **Context Distraction**: Zu viel Info erschwert Focus (needle-in-haystack Problem)

**Context Window Length Konfiguration:**
- Verfügbar in Memory Nodes (Postgres, Redis)
- Definiert Anzahl previous Interactions
- Typischer Range: 2-10 Interactions
- Testing zeigte: 10 Messages bietet beste Balance zwischen Context Retention und Performance

### Die 9 Context Engineering Strategien

n8n hat den Fokus von "Prompt Engineering" zu **"Context Engineering"** verschoben – optimale Context-Konfiguration statt nur perfekte Prompts.

**1. Short-Term Memory**
- Speichert recent Interactions für immediate Context
- Simple Memory oder Postgres für structured Storage
- Limitiert auf defined Context Window Size
- Essentiell für Conversation Flow

**2. Long-Term Memory**
- Speichert wichtige Informationen über extended Periods
- Implementation:
  - **Google Docs/Sheets**: Simple persistent Storage
  - **Airtable**: Structured Data mit Categorization
  - **Supabase**: PostgreSQL Database mit advanced Querying
  - **Vector Databases**: Für semantic Search Capabilities
- AI entscheidet was wichtig genug zum Speichern ist
- Summarized Information wird gespeichert, nicht transient Queries
- Vor jeder Interaction retrieved und in Context injected

**3. Context Expansion durch Tool Calling**
- Tools injizieren live Data dynamisch in Conversation
- Beispiel: Perplexity Tool für Web Data Access
- Process Flow: Short-term Memory Retrieval → User Query → Model Processing → Tool Call → Tool Response → Final Processing
- Risk: Jeder Tool Call addiert Context, kann zu Pollution führen

**4. Retrieval-Augmented Generation (RAG)**
- Zugriff auf vast Data ohne Context Window Overload
- Dokumente in Chunks brechen, in Vector Database speichern
- Relevante Pieces via semantic Search retrieven
- Example Implementations:
  - PDF Documents (Text, Images, Tables)
  - Google Drive Folders
  - Supabase Vector Store
- **Wichtig:** Entire Vector Store Response dumped in Context Window – Size Management essentiell

**5. Context Isolation (Multi-Agent Systems)**
- Responsibilities über multiple Sub-Agents splitten
- Jeder Agent hat own Memory und Context
- Verhindert Main Agent Context Clutter
- Beispiel: Newsletter Generation Team mit Research, Writing, Publishing, Analytics, Social Media, Subscriber Management Sub-Agents
- Main Agent delegiert Tasks, Sub-Agents processen independently
- Eine der wenigen Wege um External Tools zu managen ohne Context zu overwhelmen

**6. Context Summarization**
- Daten komprimieren vor AI-Feeding
- Beispiel: Full HTML scrapen → AI Chain summarized zu 3 Key Points (je ein Satz)
- Main Agent erhält nur concise Summary
- Reduziert Tokens, speeds Processing, senkt Costs
- Nutze LLM Chain oder Sub-Agent für Summarization

**7. Deep Research Blueprint**
- Für data-heavy, long-running Tasks
- Execute Sub-Workflows multiple Times
- Careful Context Passing zwischen Nodes
- Chain-of-thought Model für comprehensive Reports
- Kann Stunden dauern aber handled vast Context effectively

**8. Context Formatting**
- HTML zu Markdown konvertieren für cleaner, parseable Content
- Reduziert Token Usage signifikant
- Nutze n8n's Markdown Node oder Services wie Firecrawl.dev
- Macht Data AI-friendly

**9. Context Trimming**
- Text Length limitieren um in Token Limits zu passen
- Simple Approach: Nimm first N Characters (z.B. 1000)
- Andere Methoden:
  - Reduce Short-term Memory Window Length
  - Limit Vector Database Query Chunks returned
- Maintained manageable Context Size

## Vollständige Prompt-Beispiele aus der Praxis

### Customer Support Agent

```
Du bist ein Customer Support Agent für [Company Name].

Deine Rolle:
- Beantworte Kundenfragen basierend auf der Knowledge Base
- Sei höflich, professionell und empathisch
- Liefere akkurate Informationen aus unserer Dokumentation

Verfügbare Tools:
- knowledge_base_search: Suche unsere Dokumentation nach Antworten
- create_ticket: Erstelle Support-Ticket für komplexe Issues
- send_email: Sende Follow-up Emails an Kunden

Guidelines:
1. Suche IMMER zuerst die Knowledge Base bevor du antwortest
2. Falls du keine Antwort findest, erkenne dies an und biete Ticket-Erstellung an
3. Sei prägnant aber thorough in deinen Antworten
4. Stelle klärende Fragen falls User-Request unklar ist
5. Beende Responses mit "Kann ich dir noch wobei helfen?"

Constraints:
- Erfinde KEINE Informationen die nicht in der Knowledge Base sind
- Versprich KEINE Features oder Capabilities die nicht existieren
- Behalte IMMER einen professionellen Ton
```

### Data Analyst Agent

```
Du bist ein intelligenter Data Analyst Agent der Usern hilft 
Daten zu querien und zu verstehen.

Capabilities:
- Übersetze natürliche Sprache in SQL Queries
- Führe Queries gegen die Database aus
- Erkläre Results in Plain Language
- Generiere Visualizations wenn appropriate

Process:
1. Verstehe die User-Frage über die Data
2. Nutze sql_query Tool um relevante Data zu fetchen
3. Analysiere die Results
4. Falls Visualization helfen würde, nutze chart_generator Tool
5. Liefere Insights in clear, non-technical Language

Wichtig:
- Validiere IMMER dass Queries read-only sind (SELECT Statements)
- Erkläre Assumptions die du über die Data machst
- Falls Query langsam sein könnte oder large Results returnen, warne den User
- Bei Zahlen, füge relevant Context und Comparisons hinzu

Verfügbare Tools:
- sql_query: Execute SQL Queries auf der Database
- chart_generator: Create Charts from Data
- data_summarizer: Generate Statistical Summaries
```

### Telegram Bot mit Memory

```
Du bist ein hilfreicher Assistant. Du kommunizierst mit einem User 
namens {{ $json.message.from.first_name }}.

Guidelines:
- Sprich den User jedes Mal mit Namen an
- Sei conversational und friendly
- Falls der User nach einem Image fragt, sende IMMER den Link zum 
  Image in der final Reply
- Du kannst multiple Tools nutzen um einen Request zu completen

Verfügbare Tools:
- image_generator: Call this tool wenn User bittet etwas zu zeichnen. 
  Falls du Response von diesem Tool bekommst, forward es zum Telegram Tool
- telegram_sender: Nutze dies um Images oder Documents zurück zum User zu senden

Remember:
- Maintain Context von previous Messages in der Conversation
- Sei helpful und provide detailed Responses wenn appropriate
- Falls du unsicher über etwas bist, frage nach Clarification
```

### Email Summarization Agent

```
Du bist ein Email Summarization Assistant der Usern hilft on top 
ihrer Inbox zu bleiben.

Deine Task:
1. Fetch unread Emails von Gmail
2. Kategorisiere Emails nach Importance und Urgency
3. Summarize Key Information von jedem Email
4. Extrahiere Action Items und Deadlines
5. Generiere concise Morning und Evening Digest

Summarization Guidelines:
- Nutze Bullet Points für Clarity
- Highlight urgent Items im Subject Line
- Include Sender Name und Timestamp
- Extrahiere specific Action Items oder needed Decisions
- Gruppiere Emails nach Category (work, personal, newsletters, etc.)

Format für jedes Email:
**Von:** [Sender Name]
**Betreff:** [Subject Line]
**Zeit:** [Timestamp]
**Zusammenfassung:** [2-3 Satz Summary]
**Action Items:** [Liste required Actions]
**Priorität:** [High/Medium/Low]

Sende zwei Digests:
- Morning Digest: Emails vom previous Evening
- Evening Digest: Emails vom Day
```

## Prompt-Pattern und Architekturen

### Pattern 1: Chained AI Requests

Simple Sequence von AI Calls, jeder feeds in den nächsten.

**Best für:**
- Content Generation Pipelines
- Multi-Stage Data Processing
- Predictable Outcomes

**Prompt Structure:**
```
Step 1 Agent: "Transkribiere diese Audio-Datei"
Step 2 Agent: "Fasse diese Key Points aus der Transcription zusammen"
Step 3 Agent: "Erstelle Social Media Posts aus dieser Summary"
```

### Pattern 2: Single Agent mit Tools

Ein Agent maintained State und decided welche Tools zu nutzen.

**System Message Template:**
```
Du bist ein [Rolle] der [primary Function].

Dein Ziel ist [main Objective].

Du hast Zugriff auf folgende Tools:
1. [tool_name]: [Beschreibung was es tut und wann zu nutzen]
2. [tool_name]: [Beschreibung]

Bei Processing von Requests:
- [Step-by-step Approach]
- [Decision Criteria für Tool Selection]
- [Error Handling Approach]

Falls du eine Task nicht completen kannst:
- [Fallback Behavior]
- [Wie Limitations kommunizieren]
```

### Pattern 3: Multi-Agent mit Gatekeeper

Primary Agent delegiert zu Specialist Agents.

**Gatekeeper Agent Prompt:**
```
Du bist ein Coordinator Agent der specialized Assistants managed.

Deine Rolle:
- Analysiere incoming Requests
- Determine welche Specialist Agent(s) zu involvieren
- Formuliere clear Instructions für Specialist Agents
- Integriere Results von multiple Agents
- Provide coherent Final Responses

Verfügbare Specialist Agents:
- [agent_name]: [Expertise Area und wann zu nutzen]
- [agent_name]: [Expertise Area und wann zu nutzen]

Decision Process:
1. Classify den Request Type
2. Identify required Expertise
3. Delegate zu appropriate Specialist(s)
4. Coordinate parallel Work falls needed
5. Synthesize Results in Final Response

Quality Control:
- Verify Specialist Outputs sind complete
- Ensure Consistency über multiple Responses
- Handle Conflicts oder Discrepancies
```

## Allgemeine LLM Techniken und n8n-Spezifika

Die meisten Standard-LLM-Prompt-Techniken funktionieren in n8n, aber mit **n8n-spezifischen Adaptionen**:

### Few-Shot Learning

**Standard LLM Approach:** Beispiele direkt im Prompt bereitstellen.

**n8n Adaptation:**
- Examples direkt in System Message einfügen
- Memory nutzen um auf past successful Interactions zu referenzieren
- Patterns in External Databases für Retrieval speichern
- Agents lernen from recent successful Interactions

### Chain-of-Thought Prompting

**Standard LLM Approach:** Model auffordern step-by-step zu reasonen.

**n8n Implementation:**
- **ReAct Agent** (deprecated): Implementierte dedicated ReAct (Reasoning Acting) Logic
- **Tools Agent mit CoT Instructions**: In System Message step-by-step Reasoning vorgeben
- **Claude Extended Thinking**: Dedicated Thinking Tokens (native Model Capability)
- **Chain of Thought Simulation Workflows**: Nutze lightweight LLMs in Loops
- **Think Node Functionality**: Enhanced Reasoning Capabilities

**Prompt Pattern:**
```
Bei Processing von User Requests:
1. Analysiere die Anfrage gründlich
2. Identifiziere welche Tools benötigt werden
3. Plane die Execution Order
4. Execute Tools sequentially
5. Review Results und compile Final Answer

Denke laut über jeden Step nach bevor du handelst.
```

### Role Prompting

**Standard LLM Approach:** Define Model's Persona und Expertise.

**n8n Adaptation:**
- Identisch zu Standard-Approach
- Set im System Message Field
- Funktioniert excellent in n8n

**Example:**
```
Du bist ein [spezifische Rolle] mit Expertise in [Domain]. 
Deine Aufgabe ist [specific Task]. Du bist bekannt für 
[personality Trait oder Skill].
```

### Instruction Following

**Standard LLM Approach:** Clear, explicit Commands.

**n8n Adaptation:**
- Noch wichtiger in n8n da Agent Tool Calling decisions trifft
- Nutze imperative Language: "Nutze Tool X BEVOR du Tool Y aufrufst"
- Specify exact Conditions: "WENN User nach Image fragt, DANN nutze image_generator"

### Output Structuring

**Standard LLM Approach:** Request specific Format (JSON, Markdown, etc.).

**n8n Adaptation:**
- **"Require Specific Output Format" Parameter** enablen
- Connect **Output Parser Sub-Nodes** (Structured Output Parser, Item List Parser)
- **Wichtiger Caveat:** n8n Documentation empfiehlt GEGEN Structured Output Parsing direkt im Agent für Reliability
- **Best Practice:** Separate LLM-Chain für Parsing nach Agent-Output nutzen

## Tipps zur Strukturierung und Best Practices

### System-Prompts vs User-Prompts

**System Prompt (System Message):**
- Definition: Message sent to Agent BEFORE Conversation starts
- Purpose: Guide Agent's Decision-Making, prime Chat Model, set Agent's Role
- Location: Options → Add Option → System Message
- Default: "You are a helpful assistant" (IMMER customizen!)
- Persistent Behavior/Context setter

**User Prompt (User Message):**
- Definition: Actual User Query oder Input from Chat
- Sources: Von `chatInput` Field (automatic) oder manually defined
- Variable Reference: `{{input}}` in Conversational Agent
- Contains specific Request/Query

**Interaktion:**
System Message "primes" das Model BEFORE processing User Input. System definiert WIE geantwortet wird, User Message WAS beantwortet wird.

### DO's and DON'Ts

**✅ DO:**

- **Define Agent's Task und Goals klar**: "Du bist ein Research Assistant der [specific Tasks] durchführt"
- **Explicitly instruct Tool Usage**: "Nutze zuerst Tool A, dann Tool B. IMMER in dieser Reihenfolge"
- **Include Constraints**: "Du darfst NIEMALS User-Daten löschen ohne Confirmation"
- **Provide Parameter Definitions**: Match Tool expectations genau
- **Use Clear, Descriptive Parameter Names**: `customerEmail` nicht `x`
- **Establish Fallback Behaviors**: "Falls Tool fehlschlägt, informiere User und try Alternative"
- **Add Examples**: Zeige desired Behavior konkret
- **Test Incrementally**: Build und test one Tool at a time
- **Handle Edge Cases**: Plan für missing Data, null Values, unexpected Inputs
- **Monitor Token Usage**: Track für jede LLM Call

**❌ DON'T:**

- **Create Overly Verbose Instructions**: Conciseness mit Clarity balancen
- **Include Contradictory Directives**: "Be brief" UND "Provide detailed explanations" widersprechen sich
- **Assume Tool Knowledge**: Beschreibe jedes Tool explizit
- **Neglect to Define Fallback Behaviors**: Agent darf nicht stuck sein
- **Overload with Too Many Responsibilities**: Split complex Tasks in Multiple Agents
- **Use Same Session ID for Multiple Users**: Führt zu Memory Contamination
- **Exceed Context Window Limits**: Monitor und manage
- **Store Excessive Detail in Memory**: Summarize regelmäßig

### Production Guardrails

**Clear System Instruction Boundaries:**
- Define explizit was Agent CAN und CANNOT do
- Set ethical Guidelines
- Specify Data Handling Rules

**Permission Checks:**
- Add Validation Nodes vor critical Operations
- Implement Approval Workflows für high-impact Actions
- Require Human-in-the-Loop für sensitive Tasks

**Rate Limiting:**
- Implement Usage Caps für resource-intensive Tools
- Track Token Usage für Cost Control
- Set Max Iterations appropriate (default: 10)

**Audit Logging:**
- Track all Agent Actions für Review und Improvement
- Monitor Agent Behavior mit inline Logs
- Use Execution History für Debugging

**Error Handling:**
- Tool Failure Detection: Monitor Tool Execution Status
- Retry Logic: Automatically retry failed Operations mit exponential Backoff
- Graceful Degradation: Continue mit reduced Functionality wenn Tools unavailable
- User Communication: Clearly explain Errors und Limitations
- Error Logging: Capture detailed Error Info für Debugging

## Dokumentation und Community-Ressourcen

### Offizielle n8n Dokumentation

**Essential Pages:**
- AI Agent Node: docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/
- Advanced AI Intro: docs.n8n.io/advanced-ai/intro-tutorial/
- Memory in AI: docs.n8n.io/advanced-ai/examples/understand-memory/
- $fromAI() Function: docs.n8n.io/advanced-ai/examples/using-the-fromai-function/
- Expressions: docs.n8n.io/code/expressions/
- Common Issues: docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/common-issues/

### n8n Blog Posts

**Must-Read Articles:**
- "How to Build Your First AI Agent": blog.n8n.io/how-to-build-ai-agent/
- "AI Agents Explained": blog.n8n.io/ai-agents/
- "AI Agentic Workflows Guide": blog.n8n.io/ai-agentic-workflows/
- "15 Practical AI Agent Examples": blog.n8n.io/ai-agents-examples/

### Community Resources

**Forums und Discussions:**
- n8n Community Forum: community.n8n.io/
- Active discussions über Prompt Engineering
- Real-world Problem Solutions
- User-contributed Workflows

**External Guides:**
- Product Compass: "AI Agent Architectures" (11 Essential Principles)
- Pageon.ai: "Master N8N AI Agents Guide"
- The AI Automators: Context Engineering Strategies

### Workflow Templates

**n8n Template Library:**
- Main Library: n8n.io/workflows/
- AI Category: n8n.io/workflows/categories/ai/
- RAG Workflows: n8n.io/workflows/categories/ai-rag/

**Notable Templates:**
- Template #6270: "Build Your First AI Agent" (Best Starting Point)
- Template #5045: "AI Prompt Generator" (Meta-Workflow)
- Template #4197: "Improve AI Agent System Prompts" (Uses GPT-4o)
- Template #2893: "Dynamic Prompts from GitHub"

**GitHub Resources:**
- awesome-n8n-templates: github.com/enescingoz/awesome-n8n-templates
- n8n-free-templates: github.com/wassupjay/n8n-free-templates (200+ AI Workflows)

### Video Tutorials

- Official n8n YouTube Channel: Building AI Agents Series
- Community Tutorials: AI Foundations n8n Guides
- Udemy: "n8n - AI Agents, AI Automations & AI Voice Agents"

## Bekannte Limitationen und Workarounds

### Critical Known Issues

**1. Tool Messages nicht in Memory gespeichert (Bug #14361)**
- **Problem**: AI Agent und Memory Nodes speichern NUR Input/Output Messages, NICHT Tool Messages
- **Impact**: Agents "vergessen" welche Tools sie called haben, führt zu Hallucinations
- **Workaround**: 
  - Manually log Tool Executions
  - Use Chat Memory Manager um Tool Results zu injecten
  - Implement custom Memory Tracking

**2. Context Window Length Parameter funktioniert nicht immer**
- **Problem**: Redis Chat Memory Context Window Length Parameter ignoriert manchmal
- **Impact**: All Messages retrieved regardless of Setting
- **Workaround**: Implement manual Trimming in Workflow Logic

**3. Chains unterstützen kein Memory in n8n**
- **Problem**: Unlike native LangChain, n8n Chains haben kein Memory Support
- **Impact**: Sequential Calls without Context Retention
- **Workaround**: Nutze Agents statt Chains für Memory-requiring Tasks

**4. Memory persistiert nicht automatisch**
- **Problem**: Simple Memory verliert Data zwischen Workflow Executions
- **Impact**: No Long-term Conversation History
- **Workaround**: Nutze Postgres/Redis Chat Memory für Persistence

**5. Sub-Node Expressions resolven nur zu First Item**
- **Problem**: Expressions in Sub-Nodes (Tools, Memory) resolven NUR first Input Item
- **Impact**: Can't access Multiple Items in Tool Parameters
- **Workaround**: Pre-process Data in separate Node vor Agent

### Best-Practice Workarounds

**Für Tool Message Issue:**
```
[AI Agent]
  → [Code Node: Log Tool Calls]
  → [Chat Memory Manager: Inject Tool Results]
  → [Continue Workflow]
```

**Für Memory Persistence:**
```
[Chat Trigger]
  → [Postgres Chat Memory Node]
      Session Key: chat_with_{{ $json.message.chat.id }}
      Table: chat_history
  → [AI Agent]
```

**Für Context Limits:**
```
[Large Data Source]
  → [Summarization Sub-Agent]
  → [Main Agent mit Summarized Context]
  → [Response]
```

## Zusammenfassung: Key Takeaways

**1. n8n hat zu Tools Agent als Standard konsolidiert** – Alle früheren Agent-Typen (außer specialized Use Cases) wurden entfernt für simplified, reliable Architecture.

**2. System Message ist das Herzstück** – Hier definierst du Role, Tools, Workflow, Constraints. Default "You are a helpful assistant" IMMER customizen.

**3. Explizite Tool-Instructions sind essentiell** – "Du hast Access zu Tool X" reicht nicht. Sage WANN, WIE, IN WELCHER REIHENFOLGE Tools zu nutzen sind.

**4. Expression Mode für Variables** – MUSS aktiviert werden in System Message und anderen Fields um `{{ $json.variable }}` zu nutzen. Objekte zu Strings mit `.toJsonString()` konvertieren.

**5. $fromAI() für dynamische Parameter** – Compact Way um AI Parameters intelligent befüllen zu lassen based on Context. Nur für Tools Agent.

**6. Context Engineering \u003e Prompt Engineering** – Moderne AI Agent Development fokussiert auf optimale Context Configuration, nicht nur perfekte Prompts. 9 Strategien: Short/Long-term Memory, RAG, Context Isolation, Summarization, Trimming, Formatting, Expansion, Deep Research.

**7. Memory Persistence erfordert External Storage** – Simple Memory nur für Testing. Postgres/Redis Chat Memory für Production. Session Keys für User-Separation.

**8. Tool Messages Bug beachten** – Current Limitation wo Tool Executions nicht in Memory stored werden, kann zu Hallucinations führen. Workarounds implementieren.

**9. Die 11 Community Principles befolgen** – Add Memory, Use Loops, Suggest Tool Patterns, Define Role, Explicit Instructions, Add Constraints, Provide Examples, Consistent Personality, Structured Thinking, Fallback Behaviors, Context-Aware Instructions.

**10. Incremental Testing ist kritisch** – Build one Tool at a time, test thoroughly, monitor Execution Logs, iterate based on real Usage Patterns.

**11. Production braucht Guardrails** – Error Handling, Rate Limiting, Permission Checks, Audit Logging, Human-in-the-Loop für critical Actions.

**12. Community nutzen** – Extensive Template Library, aktive Forums, comprehensive Documentation. Start mit Templates, customize für eigene Needs, contribute back.

Der Erfolg mit n8n AI Agents kommt durch: **Clarity in Instructions, Appropriate Memory Configuration, Smart Context Management, Iterative Testing, und Community Learning.** Die Plattform macht AI Agent Development accessible through visual Workflows while maintaining Power und Flexibility von LangChain.