(() => {
  "use strict";

  const STORAGE_KEY = "ponderers.state.v1";
  const VIEWS = new Set([
    "today",
    "calendar",
    "meals",
    "notes",
    "wishes",
    "plans",
    "children",
    "faith",
    "draw",
    "more"
  ]);
  const PRIMARY_VIEWS = new Set(["today", "calendar", "meals", "notes", "more"]);
  const app = document.getElementById("app");

  let state = loadState();
  let currentView = getInitialView();
  let canvasCleanup = null;
  const ui = {
    selectedThreadId: state.threads[0]?.id || "",
    selectedChildId: state.children[0]?.id || "",
    wishFilter: "all",
    mealIdea: "",
    promptTurn: 0,
    drawColor: "#20231f",
    drawSize: 5,
    drawHistory: []
  };

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return normalizeState(JSON.parse(stored));
      }
    } catch (error) {
      console.warn("Could not load PONDERERS data", error);
    }
    return seedState();
  }

  function normalizeState(raw) {
    const seeded = seedState();
    return {
      ...seeded,
      ...raw,
      familyMembers: Array.isArray(raw.familyMembers) ? raw.familyMembers : seeded.familyMembers,
      children: Array.isArray(raw.children) ? raw.children : seeded.children,
      events: Array.isArray(raw.events) ? raw.events : seeded.events,
      notes: Array.isArray(raw.notes) ? raw.notes : seeded.notes,
      meals: Array.isArray(raw.meals) ? raw.meals : seeded.meals,
      groceries: Array.isArray(raw.groceries) ? raw.groceries : seeded.groceries,
      threads: Array.isArray(raw.threads) ? raw.threads : seeded.threads,
      wishes: Array.isArray(raw.wishes) ? raw.wishes : seeded.wishes,
      prayers: Array.isArray(raw.prayers) ? raw.prayers : seeded.prayers,
      gratitude: Array.isArray(raw.gratitude) ? raw.gratitude : seeded.gratitude,
      encouragements: Array.isArray(raw.encouragements) ? raw.encouragements : seeded.encouragements,
      drawings: Array.isArray(raw.drawings) ? raw.drawings : seeded.drawings
    };
  }

  function seedState() {
    const today = new Date();
    const isoToday = dateISO(today);
    const tomorrow = dateISO(addDays(today, 1));
    const week = weekDates(today);
    return {
      version: 1,
      familyName: "The PONDERERS Home",
      familyMembers: [
        { id: "dad", name: "Dad", color: "#2f6b57" },
        { id: "mom", name: "Mom", color: "#c85f52" },
        { id: "family", name: "Family", color: "#3f78a7" },
        { id: "child-1", name: "Child 1", color: "#b8862f" },
        { id: "child-2", name: "Child 2", color: "#6f5c91" },
        { id: "baby", name: "Baby", color: "#2f6b57" }
      ],
      children: [
        {
          id: "child-1",
          name: "Child 1",
          color: "#b8862f",
          entries: [
            {
              id: uid(),
              type: "memory",
              date: isoToday,
              text: "Loved helping pick dinner tonight."
            }
          ]
        },
        {
          id: "child-2",
          name: "Child 2",
          color: "#6f5c91",
          entries: [
            {
              id: uid(),
              type: "note",
              date: isoToday,
              text: "Needs a fresh change of clothes in the bag."
            }
          ]
        },
        {
          id: "baby",
          name: "Baby",
          color: "#2f6b57",
          entries: [
            {
              id: uid(),
              type: "milestone",
              date: isoToday,
              text: "Add first milestone here."
            }
          ]
        }
      ],
      events: [
        {
          id: uid(),
          title: "Dad work block",
          date: isoToday,
          start: "08:30",
          end: "16:00",
          owner: "dad",
          responsible: "dad",
          location: "Work",
          prep: "Lunch packed, check commute",
          notes: "Work schedule connection comes after the local build feels right."
        },
        {
          id: uid(),
          title: "Mom activity",
          date: isoToday,
          start: "10:00",
          end: "11:15",
          owner: "mom",
          responsible: "mom",
          location: "Town",
          prep: "Confirm timing",
          notes: ""
        },
        {
          id: uid(),
          title: "Family dinner",
          date: isoToday,
          start: "17:30",
          end: "18:15",
          owner: "family",
          responsible: "family",
          location: "Home",
          prep: "Thaw chicken, chop vegetables",
          notes: "Keep this simple."
        },
        {
          id: uid(),
          title: "Library stop",
          date: tomorrow,
          start: "11:00",
          end: "11:45",
          owner: "family",
          responsible: "mom",
          location: "Library",
          prep: "Return books",
          notes: ""
        }
      ],
      notes: [
        {
          id: uid(),
          text: "Diapers are low.",
          category: "Home",
          createdAt: new Date().toISOString(),
          expiresMode: "tonight",
          expiresAt: endOfToday().toISOString(),
          pinned: true,
          seen: false
        },
        {
          id: uid(),
          text: "Ask about Sunday lunch.",
          category: "Family",
          createdAt: new Date().toISOString(),
          expiresMode: "tomorrow",
          expiresAt: addDays(endOfToday(), 1).toISOString(),
          pinned: false,
          seen: false
        }
      ],
      meals: [
        {
          id: uid(),
          date: isoToday,
          name: "Chicken bowls",
          prep: "Thaw chicken, chop vegetables",
          tags: "quick, leftovers"
        },
        {
          id: uid(),
          date: week[1],
          name: "Tacos",
          prep: "Brown meat, prep toppings",
          tags: "kid friendly"
        },
        {
          id: uid(),
          date: week[2],
          name: "Pasta night",
          prep: "Use pantry sauce",
          tags: "easy"
        }
      ],
      groceries: [
        { id: uid(), text: "Chicken", done: false },
        { id: uid(), text: "Fruit", done: false },
        { id: uid(), text: "Tortillas", done: true }
      ],
      threads: [
        {
          id: uid(),
          title: "Weekend plan",
          category: "Family",
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: uid(),
              author: "Dad",
              text: "Can we protect one slower family block this weekend?",
              createdAt: new Date().toISOString(),
              kind: "message"
            },
            {
              id: uid(),
              author: "Mom",
              text: "Yes. Saturday morning feels best.",
              createdAt: new Date().toISOString(),
              kind: "decision"
            }
          ],
          tasks: [
            { id: uid(), text: "Pick one family outing", done: false }
          ]
        },
        {
          id: uid(),
          title: "Meal planning",
          category: "Meals",
          createdAt: new Date().toISOString(),
          messages: [
            {
              id: uid(),
              author: "PONDERERS",
              text: "Busy nights should get the fastest meals.",
              createdAt: new Date().toISOString(),
              kind: "message"
            }
          ],
          tasks: []
        }
      ],
      wishes: [
        {
          id: uid(),
          title: "Coffee walk downtown",
          type: "Date idea",
          owner: "couple",
          url: "",
          priority: "Soon",
          status: "Saved",
          occasion: "Date night",
          notes: "Simple, low-lift, no reservations."
        },
        {
          id: uid(),
          title: "Zoo membership",
          type: "Family activity",
          owner: "family",
          url: "",
          priority: "Someday",
          status: "Saved",
          occasion: "Family",
          notes: "Good grandparents gift idea."
        },
        {
          id: uid(),
          title: "Birthday bike helmet",
          type: "Product",
          owner: "child-1",
          url: "",
          priority: "High",
          status: "Saved",
          occasion: "Birthday",
          notes: "Check size before buying."
        }
      ],
      prayers: [
        { id: uid(), text: "Patience and steadiness this week.", createdAt: new Date().toISOString(), done: false }
      ],
      gratitude: [
        { id: uid(), text: "Dinner at home together.", createdAt: new Date().toISOString() }
      ],
      encouragements: [
        { id: uid(), text: "Thank you for carrying so much with tenderness.", createdAt: new Date().toISOString(), from: "PONDERERS" }
      ],
      drawings: []
    };
  }

  function getInitialView() {
    const hashView = window.location.hash.replace("#", "");
    return VIEWS.has(hashView) ? hashView : "today";
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function render() {
    if (canvasCleanup) {
      canvasCleanup();
      canvasCleanup = null;
    }

    const renderer = {
      today: renderToday,
      calendar: renderCalendar,
      meals: renderMeals,
      notes: renderNotes,
      wishes: renderWishes,
      plans: renderPlans,
      children: renderChildren,
      faith: renderFaith,
      draw: renderDraw,
      more: renderMore
    }[currentView] || renderToday;

    app.innerHTML = renderer();
    app.focus({ preventScroll: true });
    updateNav();

    if (currentView === "draw") {
      setupDrawingCanvas();
    }
  }

  function updateNav() {
    document.querySelectorAll("[data-view]").forEach((button) => {
      const view = button.dataset.view;
      const activeView = PRIMARY_VIEWS.has(currentView) ? currentView : "more";
      button.classList.toggle("is-active", view === activeView);
    });
  }

  function setView(view) {
    if (!VIEWS.has(view)) return;
    currentView = view;
    history.replaceState(null, "", `#${view}`);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderToday() {
    const today = dateISO(new Date());
    const events = eventsForDate(today);
    const meal = mealForDate(today);
    const notes = activeNotes().slice(0, 4);
    const prompts = generatePrompts().slice(0, 4);
    const verse = dailyVerse();
    const encouragement = latestEncouragement();

    return `
      <section class="screen">
        <div class="panel hero-panel">
          <div class="hero-top">
            <div class="hero-copy">
              <p class="hero-date">${esc(formatLongDate(today))}</p>
              <h2>Today at home</h2>
              <p>${esc(todaySummary(events, meal, notes))}</p>
            </div>
            <div class="home-scene" aria-hidden="true">${renderHomeScene()}</div>
          </div>
          <div class="stats-strip">
            <div class="stat"><strong>${events.length}</strong><span>events</span></div>
            <div class="stat"><strong>${meal ? 1 : 0}</strong><span>dinner plan</span></div>
            <div class="stat"><strong>${activeWishes().length}</strong><span>wishes</span></div>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="panel">
            <div class="section-head">
              <h3>Schedule</h3>
              <button class="plain-button" data-view="calendar" type="button">Calendar</button>
            </div>
            ${events.length ? `<div class="item-list">${events.map(renderEventItem).join("")}</div>` : emptyState("Nothing scheduled today.")}
          </div>

          <div class="panel">
            <div class="section-head">
              <h3>Dinner</h3>
              <button class="plain-button" data-view="meals" type="button">Meals</button>
            </div>
            ${meal ? renderMealItem(meal) : emptyState("No dinner set for tonight.")}
          </div>

          <div class="panel">
            <div class="section-head">
              <h3>Prompts</h3>
              <button class="plain-button" data-action="refresh-prompts" type="button">Refresh</button>
            </div>
            <div class="item-list">
              ${prompts.map(renderPrompt).join("")}
            </div>
          </div>

          <div class="panel">
            <div class="section-head">
              <h3>Notes</h3>
              <button class="plain-button" data-view="notes" type="button">Notes</button>
            </div>
            ${notes.length ? `<div class="item-list">${notes.map(renderNoteItem).join("")}</div>` : emptyState("No active notes.")}
          </div>

          <div class="panel">
            <div class="section-head">
              <h3>Quick add</h3>
            </div>
            ${renderQuickActions()}
          </div>

          <div class="panel">
            <div class="item-list">
              <article class="item verse-card">
                <p class="item-title">Daily verse</p>
                <p class="item-meta">${esc(verse.text)}</p>
                <span class="chip gold">${esc(verse.ref)}</span>
              </article>
              <article class="item encouragement-card">
                <p class="item-title">Encouragement</p>
                <p class="item-meta">${esc(encouragement)}</p>
              </article>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderCalendar() {
    const week = weekDates(new Date());
    const allEvents = [...state.events].sort(sortEvents);
    return `
      <section class="screen">
        <div class="screen-title">
          <div>
            <h2>Calendar</h2>
            <p>Apple Calendar first, with manual events working now.</p>
          </div>
          <button class="primary-button" data-action="export-ics" type="button">Apple export</button>
        </div>

        <div class="two-column">
          <div class="panel">
            <div class="section-head">
              <h3>This week</h3>
              <label class="ghost-button" for="ics-import">Import .ics</label>
              <input class="visually-hidden" id="ics-import" type="file" accept=".ics,text/calendar" data-action="import-ics">
            </div>
            <div class="week-grid">
              ${week.map((day) => renderCalendarDay(day)).join("")}
            </div>
          </div>

          <form class="form-panel" data-form="event" autocomplete="off">
            <h3>Add event</h3>
            <div class="form-grid">
              <label class="span-2">Title
                <input name="title" required placeholder="Soccer practice">
              </label>
              <label>Date
                <input name="date" type="date" required value="${dateISO(new Date())}">
              </label>
              <label>Person
                <select name="owner">${memberOptions("family")}</select>
              </label>
              <label>Start
                <input name="start" type="time" value="17:30">
              </label>
              <label>End
                <input name="end" type="time" value="18:15">
              </label>
              <label>Responsible
                <select name="responsible">${memberOptions("family")}</select>
              </label>
              <label>Location
                <input name="location" placeholder="Home">
              </label>
              <label class="span-2">Prep
                <input name="prep" placeholder="Snacks, bag, forms">
              </label>
              <label class="span-2">Notes
                <textarea name="notes" placeholder="Anything worth remembering"></textarea>
              </label>
            </div>
            <div class="actions-row">
              <button class="primary-button" type="submit">Save event</button>
            </div>
          </form>
        </div>

        <div class="panel">
          <div class="section-head">
            <h3>Upcoming</h3>
          </div>
          ${allEvents.length ? `<div class="item-list">${allEvents.map(renderEventItem).join("")}</div>` : emptyState("No events yet.")}
        </div>
      </section>
    `;
  }

  function renderMeals() {
    const week = weekDates(new Date());
    const idea = ui.mealIdea || mealIdea();
    return `
      <section class="screen">
        <div class="screen-title">
          <div>
            <h2>Meals</h2>
            <p>Dinners, groceries, and prep for the week.</p>
          </div>
          <button class="primary-button" data-action="new-meal-idea" type="button">AI meal idea</button>
        </div>

        <div class="two-column">
          <div class="panel">
            <div class="section-head">
              <h3>This week</h3>
            </div>
            <div class="week-grid">
              ${week.map((day) => renderMealDay(day)).join("")}
            </div>
          </div>

          <form class="form-panel" data-form="meal" autocomplete="off">
            <h3>Add dinner</h3>
            <div class="form-grid">
              <label>Date
                <input name="date" type="date" required value="${dateISO(new Date())}">
              </label>
              <label>Meal
                <input name="name" required placeholder="Sheet pan chicken">
              </label>
              <label class="span-2">Prep
                <input name="prep" placeholder="Thaw, chop, marinate">
              </label>
              <label class="span-2">Tags
                <input name="tags" placeholder="quick, kid friendly">
              </label>
              <label class="span-2">Add groceries
                <input name="groceries" placeholder="Chicken, rice, fruit">
              </label>
            </div>
            <div class="actions-row">
              <button class="primary-button" type="submit">Save dinner</button>
            </div>
          </form>
        </div>

        <div class="two-column">
          <div class="panel">
            <div class="section-head">
              <h3>Grocery list</h3>
            </div>
            <form data-form="grocery" class="actions-row" autocomplete="off">
              <input name="text" required placeholder="Add grocery item">
              <button class="primary-button" type="submit">Add</button>
            </form>
            <div class="item-list" style="margin-top: 12px;">
              ${state.groceries.length ? state.groceries.map(renderGroceryItem).join("") : emptyState("No groceries yet.")}
            </div>
          </div>

          <div class="panel">
            <article class="item prompt-card">
              <p class="item-title">AI meal prompt</p>
              <p class="item-meta">${esc(idea)}</p>
              <div class="actions-row">
                <button class="ghost-button" data-action="meal-idea-note" data-text="${escAttr(idea)}" type="button">Save as note</button>
                <button class="plain-button" data-action="new-meal-idea" type="button">Another</button>
              </div>
            </article>
          </div>
        </div>
      </section>
    `;
  }

  function renderNotes() {
    const pinned = activeNotes().filter((note) => note.pinned);
    const active = activeNotes().filter((note) => !note.pinned);
    const seen = state.notes.filter((note) => note.seen).slice(0, 6);
    return `
      <section class="screen">
        <div class="screen-title">
          <div>
            <h2>Notes</h2>
            <p>Temporary notes for the two of you.</p>
          </div>
        </div>

        <div class="two-column">
          <form class="form-panel" data-form="note" autocomplete="off">
            <h3>Add note</h3>
            <div class="form-grid">
              <label class="span-2">Note
                <textarea name="text" required placeholder="Leave something helpful"></textarea>
              </label>
              <label>Category
                <select name="category">
                  <option>Home</option>
                  <option>Errand</option>
                  <option>Kid</option>
                  <option>Meal</option>
                  <option>Prayer</option>
                  <option>Encouragement</option>
                </select>
              </label>
              <label>Expires
                <select name="expiresMode">
                  <option value="untilSeen">Until seen</option>
                  <option value="tonight">Tonight</option>
                  <option value="tomorrow">Tomorrow morning</option>
                  <option value="weekend">This weekend</option>
                  <option value="never">Never</option>
                </select>
              </label>
              <label class="span-2">
                <span class="visually-hidden">Pin note</span>
                <select name="pinned">
                  <option value="false">Normal</option>
                  <option value="true">Pinned</option>
                </select>
              </label>
            </div>
            <div class="actions-row">
              <button class="primary-button" type="submit">Save note</button>
            </div>
          </form>

          <div class="panel">
            <div class="section-head">
              <h3>Pinned</h3>
            </div>
            ${pinned.length ? `<div class="item-list">${pinned.map(renderNoteItem).join("")}</div>` : emptyState("Nothing pinned.")}
          </div>
        </div>

        <div class="two-column">
          <div class="panel">
            <div class="section-head">
              <h3>Active</h3>
            </div>
            ${active.length ? `<div class="item-list">${active.map(renderNoteItem).join("")}</div>` : emptyState("No active notes.")}
          </div>
          <div class="panel">
            <div class="section-head">
              <h3>Seen</h3>
            </div>
            ${seen.length ? `<div class="item-list">${seen.map(renderNoteItem).join("")}</div>` : emptyState("Seen notes will appear here.")}
          </div>
        </div>
      </section>
    `;
  }

  function renderWishes() {
    const wishes = state.wishes
      .filter((wish) => ui.wishFilter === "all" || wish.type === ui.wishFilter || wish.status === ui.wishFilter)
      .sort((a, b) => a.title.localeCompare(b.title));
    const types = ["all", "Product", "Date idea", "Gift idea", "Family activity", "Home idea", "Saved", "Planned", "Purchased"];
    return `
      <section class="screen">
        <div class="screen-title">
          <div>
            <h2>Wishlists</h2>
            <p>Products, date ideas, gifts, family ideas, and someday plans.</p>
          </div>
        </div>

        <div class="tag-row">
          ${types.map((type) => `
            <button class="pill-button ${ui.wishFilter === type ? "is-active" : ""}" data-action="set-wish-filter" data-filter="${escAttr(type)}" type="button">${esc(type === "all" ? "All" : type)}</button>
          `).join("")}
        </div>

        <div class="two-column">
          <form class="form-panel" data-form="wish" autocomplete="off">
            <h3>Add wish</h3>
            <div class="form-grid">
              <label class="span-2">Title
                <input name="title" required placeholder="Coffee walk downtown">
              </label>
              <label>Type
                <select name="type">
                  <option>Product</option>
                  <option>Date idea</option>
                  <option>Gift idea</option>
                  <option>Family activity</option>
                  <option>Home idea</option>
                  <option>Travel idea</option>
                </select>
              </label>
              <label>For
                <select name="owner">
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  ${state.children.map((child) => `<option value="${escAttr(child.id)}">${esc(child.name)}</option>`).join("")}
                  <option value="dad">Dad</option>
                  <option value="mom">Mom</option>
                </select>
              </label>
              <label>Priority
                <select name="priority">
                  <option>Soon</option>
                  <option>High</option>
                  <option>Someday</option>
                  <option>Low</option>
                </select>
              </label>
              <label>Occasion
                <input name="occasion" placeholder="Birthday, date night">
              </label>
              <label class="span-2">Link
                <input name="url" type="url" placeholder="https://">
              </label>
              <label class="span-2">Notes
                <textarea name="notes" placeholder="Why this belongs here"></textarea>
              </label>
            </div>
            <div class="actions-row">
              <button class="primary-button" type="submit">Save wish</button>
            </div>
          </form>

          <div class="panel">
            <div class="section-head">
              <h3>Saved wishes</h3>
              <span class="status-chip">${wishes.length}</span>
            </div>
            ${wishes.length ? `<div class="item-list">${wishes.map(renderWishItem).join("")}</div>` : emptyState("No wishes in this filter.")}
          </div>
        </div>
      </section>
    `;
  }

  function renderPlans() {
    if (!state.threads.some((thread) => thread.id === ui.selectedThreadId)) {
      ui.selectedThreadId = state.threads[0]?.id || "";
    }
    const selected = state.threads.find((thread) => thread.id === ui.selectedThreadId);
    return `
      <section class="screen">
        <div class="screen-title">
          <div>
            <h2>Plans</h2>
            <p>Chat threads, open decisions, and tasks.</p>
          </div>
          <button class="primary-button" data-action="ai-plan-note" type="button">AI nudge</button>
        </div>

        <div class="thread-layout">
          <div class="panel">
            <form data-form="thread" autocomplete="off">
              <label>New thread
                <input name="title" required placeholder="Birthday plan">
              </label>
              <div class="actions-row">
                <button class="primary-button" type="submit">Create</button>
              </div>
            </form>
            <div class="thread-list" style="margin-top: 12px;">
              ${state.threads.map(renderThreadTab).join("")}
            </div>
          </div>

          <div class="panel">
            ${selected ? renderThreadDetail(selected) : emptyState("Create a thread to start planning.")}
          </div>
        </div>
      </section>
    `;
  }

  function renderChildren() {
    if (!state.children.some((child) => child.id === ui.selectedChildId)) {
      ui.selectedChildId = state.children[0]?.id || "";
    }
    const child = state.children.find((item) => item.id === ui.selectedChildId);
    return `
      <section class="screen">
        <div class="screen-title">
          <div>
            <h2>Children</h2>
            <p>Parents-only notes, memories, activities, and milestones.</p>
          </div>
        </div>

        <div class="child-tabs">
          ${state.children.map((item) => `
            <button class="child-tab ${item.id === ui.selectedChildId ? "is-active" : ""}" data-action="select-child" data-id="${escAttr(item.id)}" type="button">
              <strong>${esc(item.name)}</strong>
              <span class="item-meta">${item.entries.length} entries</span>
            </button>
          `).join("")}
        </div>

        ${child ? `
          <div class="two-column">
            <form class="form-panel" data-form="child-entry" autocomplete="off">
              <input type="hidden" name="childId" value="${escAttr(child.id)}">
              <h3>Add for ${esc(child.name)}</h3>
              <div class="form-grid">
                <label>Type
                  <select name="type">
                    <option>note</option>
                    <option>memory</option>
                    <option>activity</option>
                    <option>milestone</option>
                    <option>prayer</option>
                  </select>
                </label>
                <label>Date
                  <input name="date" type="date" value="${dateISO(new Date())}">
                </label>
                <label class="span-2">Entry
                  <textarea name="text" required placeholder="What should we remember?"></textarea>
                </label>
              </div>
              <div class="actions-row">
                <button class="primary-button" type="submit">Save entry</button>
              </div>
            </form>

            <div class="panel">
              <div class="section-head">
                <h3>${esc(child.name)}</h3>
                <span class="chip gold">parents-only</span>
              </div>
              <div class="item-list">
                ${child.entries.length ? child.entries.slice().sort((a, b) => b.date.localeCompare(a.date)).map((entry) => renderChildEntry(child, entry)).join("") : emptyState("No entries yet.")}
              </div>
            </div>
          </div>
        ` : ""}
      </section>
    `;
  }

  function renderFaith() {
    const verse = dailyVerse();
    return `
      <section class="screen">
        <div class="screen-title">
          <div>
            <h2>Faith</h2>
            <p>Verse, prayer, gratitude, and encouragement.</p>
          </div>
        </div>

        <div class="two-column">
          <div class="panel">
            <article class="item verse-card">
              <p class="item-title">${esc(verse.ref)}</p>
              <p class="item-meta">${esc(verse.text)}</p>
            </article>
            <form data-form="prayer" autocomplete="off" style="margin-top: 12px;">
              <label>Prayer
                <textarea name="text" required placeholder="Who or what are we praying for?"></textarea>
              </label>
              <div class="actions-row">
                <button class="primary-button" type="submit">Add prayer</button>
              </div>
            </form>
          </div>

          <div class="panel">
            <form data-form="gratitude" autocomplete="off">
              <label>Gratitude
                <textarea name="text" required placeholder="What are we thankful for?"></textarea>
              </label>
              <div class="actions-row">
                <button class="primary-button" type="submit">Add gratitude</button>
              </div>
            </form>
            <form data-form="encouragement" autocomplete="off" style="margin-top: 12px;">
              <label>Encouragement
                <textarea name="text" required placeholder="Leave encouragement"></textarea>
              </label>
              <div class="actions-row">
                <button class="primary-button" type="submit">Send</button>
              </div>
            </form>
          </div>
        </div>

        <div class="two-column">
          <div class="panel">
            <div class="section-head">
              <h3>Prayer list</h3>
            </div>
            ${state.prayers.length ? `<div class="item-list">${state.prayers.map(renderPrayer).join("")}</div>` : emptyState("No prayer requests.")}
          </div>
          <div class="panel">
            <div class="section-head">
              <h3>Gratitude and encouragement</h3>
            </div>
            <div class="item-list">
              ${state.gratitude.slice(0, 5).map((item) => renderSimpleItem(item, "Gratitude", "gold")).join("")}
              ${state.encouragements.slice(0, 5).map((item) => renderSimpleItem(item, "Encouragement", "coral")).join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderDraw() {
    return `
      <section class="screen">
        <div class="screen-title">
          <div>
            <h2>Draw</h2>
            <p>Finger notes, quick sketches, and kid doodles.</p>
          </div>
        </div>

        <div class="panel">
          <div class="color-row">
            ${["#20231f", "#2f6b57", "#c85f52", "#3f78a7", "#b8862f", "#6f5c91"].map((color) => `
              <button class="color-swatch ${ui.drawColor === color ? "is-active" : ""}" style="--swatch: ${color}" data-action="set-draw-color" data-color="${color}" type="button" aria-label="Use color ${color}"></button>
            `).join("")}
            <label>Pen size
              <input name="drawSize" type="range" min="2" max="18" value="${ui.drawSize}" data-action="set-draw-size">
            </label>
          </div>
          <div class="canvas-wrap" style="margin-top: 12px;">
            <canvas id="drawing-canvas" aria-label="Drawing canvas"></canvas>
          </div>
          <div class="actions-row" style="margin-top: 12px;">
            <button class="primary-button" data-action="save-drawing" type="button">Save drawing</button>
            <button class="ghost-button" data-action="undo-drawing" type="button">Undo</button>
            <button class="danger-button" data-action="clear-drawing" type="button">Clear</button>
          </div>
        </div>

        <div class="panel">
          <div class="section-head">
            <h3>Saved drawings</h3>
          </div>
          ${state.drawings.length ? `<div class="drawing-grid">${state.drawings.map(renderDrawingCard).join("")}</div>` : emptyState("Saved drawings will appear here.")}
        </div>
      </section>
    `;
  }

  function renderMore() {
    return `
      <section class="screen">
        <div class="screen-title">
          <div>
            <h2>More</h2>
            <p>Planning spaces and private family records.</p>
          </div>
        </div>

        <div class="tile-grid">
          ${moreTile("wishes", "Wishlists", "Products, dates, gifts")}
          ${moreTile("plans", "Plans", "Threads and tasks")}
          ${moreTile("children", "Children", "Parents-only records")}
          ${moreTile("faith", "Faith", "Verse and prayer")}
          ${moreTile("draw", "Draw", "Finger notes")}
          ${moreTile("calendar", "Apple Calendar", "Import and export")}
        </div>

        <div class="panel">
          <div class="section-head">
            <h3>Family data</h3>
          </div>
          <div class="actions-row">
            <button class="ghost-button" data-action="export-data" type="button">Export data</button>
            <label class="ghost-button" for="data-import">Import data</label>
            <input class="visually-hidden" id="data-import" type="file" accept="application/json,.json" data-action="import-data">
            <button class="danger-button" data-action="reset-data" type="button">Reset sample data</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderHomeScene() {
    return `
      <svg viewBox="0 0 240 170" role="img" aria-label="">
        <rect x="14" y="18" width="212" height="136" rx="8" fill="#fff" stroke="#dfe4da"/>
        <rect x="28" y="34" width="82" height="48" rx="8" fill="#dfeee6"/>
        <rect x="124" y="34" width="74" height="48" rx="8" fill="#e0edf6"/>
        <rect x="42" y="104" width="156" height="18" rx="8" fill="#f5ead2"/>
        <circle cx="68" cy="101" r="15" fill="#2f6b57"/>
        <circle cx="119" cy="96" r="18" fill="#c85f52"/>
        <circle cx="170" cy="101" r="15" fill="#3f78a7"/>
        <path d="M48 128c20 13 124 13 144 0" fill="none" stroke="#20231f" stroke-width="5" stroke-linecap="round"/>
        <path d="M51 56h35M139 56h44M51 68h28M139 68h30" stroke="#20231f" stroke-width="5" stroke-linecap="round"/>
      </svg>
    `;
  }

  function renderQuickActions() {
    const actions = [
      { view: "notes", label: "Note", icon: "note" },
      { view: "calendar", label: "Event", icon: "calendar" },
      { view: "meals", label: "Meal", icon: "meal" },
      { view: "wishes", label: "Wish", icon: "heart" },
      { view: "draw", label: "Draw", icon: "pen" }
    ];
    return `
      <div class="quick-grid">
        ${actions.map((action) => `
          <button class="quick-action" data-view="${action.view}" type="button">
            ${icon(action.icon)}
            <span>${esc(action.label)}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  function renderCalendarDay(day) {
    const events = eventsForDate(day);
    return `
      <div class="day-cell ${day === dateISO(new Date()) ? "is-today" : ""}">
        <p class="day-name">${esc(formatWeekday(day))}<br>${esc(formatMonthDay(day))}</p>
        ${events.length ? events.map((event) => `
          <div class="item-meta"><strong>${esc(event.start || "All day")}</strong> ${esc(event.title)}</div>
        `).join("") : `<p class="item-meta">Open</p>`}
      </div>
    `;
  }

  function renderMealDay(day) {
    const meal = mealForDate(day);
    return `
      <div class="day-cell ${day === dateISO(new Date()) ? "is-today" : ""}">
        <p class="day-name">${esc(formatWeekday(day))}<br>${esc(formatMonthDay(day))}</p>
        ${meal ? `
          <p class="meal-name">${esc(meal.name)}</p>
          <p class="item-meta">${esc(meal.prep || "No prep listed")}</p>
          <div class="actions-row">
            <button class="plain-button" data-action="delete-meal" data-id="${escAttr(meal.id)}" type="button">Remove</button>
          </div>
        ` : `<p class="item-meta">No dinner yet</p>`}
      </div>
    `;
  }

  function renderEventItem(event) {
    return `
      <article class="item">
        <div class="item-main">
          <div>
            <p class="item-title">${esc(event.title)}</p>
            <p class="item-meta">${esc(formatLongDate(event.date))} ${esc(timeRange(event))}</p>
            ${event.location ? `<p class="item-meta">${esc(event.location)}</p>` : ""}
          </div>
          ${personBadge(event.owner)}
        </div>
        <div class="tag-row">
          ${event.responsible ? `<span class="chip green">owner: ${esc(memberName(event.responsible))}</span>` : ""}
          ${event.prep ? `<span class="chip blue">${esc(event.prep)}</span>` : ""}
        </div>
        <div class="actions-row">
          <button class="plain-button" data-action="delete-event" data-id="${escAttr(event.id)}" type="button">Delete</button>
        </div>
      </article>
    `;
  }

  function renderMealItem(meal) {
    return `
      <article class="item">
        <p class="item-title">${esc(meal.name)}</p>
        <p class="item-meta">${esc(meal.prep || "No prep listed")}</p>
        <div class="tag-row">
          ${(meal.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => `<span class="chip gold">${esc(tag)}</span>`).join("")}
        </div>
      </article>
    `;
  }

  function renderPrompt(prompt) {
    return `
      <article class="item prompt-card">
        <p class="item-title">${esc(prompt.title)}</p>
        <p class="item-meta">${esc(prompt.text)}</p>
        <div class="prompt-actions">
          <button class="ghost-button" data-action="prompt-note" data-text="${escAttr(prompt.text)}" type="button">Save as note</button>
          ${prompt.view ? `<button class="plain-button" data-view="${escAttr(prompt.view)}" type="button">${esc(prompt.cta || "Open")}</button>` : ""}
        </div>
      </article>
    `;
  }

  function renderNoteItem(note) {
    return `
      <article class="item">
        <div class="item-main">
          <div>
            <p class="item-title">${esc(note.text)}</p>
            <p class="item-meta">${esc(note.category)}${note.expiresMode ? `, ${esc(expirationLabel(note))}` : ""}</p>
          </div>
          ${note.pinned ? `<span class="chip gold">pinned</span>` : ""}
        </div>
        <div class="actions-row">
          <button class="plain-button" data-action="toggle-note-seen" data-id="${escAttr(note.id)}" type="button">${note.seen ? "Unsee" : "Seen"}</button>
          <button class="plain-button" data-action="toggle-note-pin" data-id="${escAttr(note.id)}" type="button">${note.pinned ? "Unpin" : "Pin"}</button>
          <button class="plain-button" data-action="delete-note" data-id="${escAttr(note.id)}" type="button">Delete</button>
        </div>
      </article>
    `;
  }

  function renderGroceryItem(item) {
    return `
      <div class="grocery-row ${item.done ? "is-done" : ""}">
        <input type="checkbox" data-action="toggle-grocery" data-id="${escAttr(item.id)}" ${item.done ? "checked" : ""} aria-label="Toggle ${escAttr(item.text)}">
        <span>${esc(item.text)}</span>
        <button class="plain-button" data-action="delete-grocery" data-id="${escAttr(item.id)}" type="button">Delete</button>
      </div>
    `;
  }

  function renderWishItem(wish) {
    const owner = wish.owner === "couple" ? "Couple" : memberName(wish.owner);
    return `
      <article class="item">
        <div class="item-main">
          <div>
            <p class="item-title">${esc(wish.title)}</p>
            <p class="item-meta">${esc(wish.type)} for ${esc(owner)}${wish.occasion ? `, ${esc(wish.occasion)}` : ""}</p>
          </div>
          <span class="priority">${esc(wish.priority)}</span>
        </div>
        ${wish.notes ? `<p class="item-meta">${esc(wish.notes)}</p>` : ""}
        ${wish.url ? `<a class="item-meta" href="${escAttr(wish.url)}" target="_blank" rel="noreferrer">Open link</a>` : ""}
        <div class="tag-row">
          <span class="chip violet">${esc(wish.status)}</span>
          <button class="status-button" data-action="wish-status" data-id="${escAttr(wish.id)}" data-status="Planned" type="button">Plan</button>
          <button class="status-button" data-action="wish-status" data-id="${escAttr(wish.id)}" data-status="Purchased" type="button">Purchased</button>
          <button class="plain-button" data-action="wish-thread" data-id="${escAttr(wish.id)}" type="button">Make thread</button>
          <button class="plain-button" data-action="delete-wish" data-id="${escAttr(wish.id)}" type="button">Delete</button>
        </div>
      </article>
    `;
  }

  function renderThreadTab(thread) {
    const openTasks = thread.tasks.filter((task) => !task.done).length;
    return `
      <button class="thread-tab ${thread.id === ui.selectedThreadId ? "is-active" : ""}" data-action="select-thread" data-id="${escAttr(thread.id)}" type="button">
        <strong>${esc(thread.title)}</strong>
        <span class="item-meta">${thread.messages.length} messages, ${openTasks} tasks</span>
      </button>
    `;
  }

  function renderThreadDetail(thread) {
    return `
      <div class="section-head">
        <h3>${esc(thread.title)}</h3>
        <span class="chip blue">${esc(thread.category || "Plan")}</span>
      </div>
      <div class="item-list">
        ${thread.messages.map((message) => `
          <article class="thread-message">
            <p><strong>${esc(message.author)}</strong></p>
            <p class="item-meta">${esc(message.text)}</p>
            <div class="actions-row">
              <span class="status-chip">${esc(message.kind || "message")}</span>
              <button class="plain-button" data-action="mark-decision" data-thread="${escAttr(thread.id)}" data-message="${escAttr(message.id)}" type="button">Decision</button>
              <button class="plain-button" data-action="message-task" data-thread="${escAttr(thread.id)}" data-message="${escAttr(message.id)}" type="button">Task</button>
            </div>
          </article>
        `).join("")}
      </div>
      <form data-form="message" autocomplete="off" style="margin-top: 12px;">
        <input type="hidden" name="threadId" value="${escAttr(thread.id)}">
        <div class="form-grid">
          <label>Author
            <select name="author">
              <option>Dad</option>
              <option>Mom</option>
              <option>PONDERERS</option>
            </select>
          </label>
          <label>Kind
            <select name="kind">
              <option>message</option>
              <option>decision</option>
              <option>task</option>
            </select>
          </label>
          <label class="span-2">Message
            <textarea name="text" required placeholder="What should we decide?"></textarea>
          </label>
        </div>
        <div class="actions-row">
          <button class="primary-button" type="submit">Send</button>
        </div>
      </form>
      ${thread.tasks.length ? `
        <div style="margin-top: 14px;">
          <h3>Tasks</h3>
          <div class="item-list">
            ${thread.tasks.map((task) => `
              <div class="grocery-row ${task.done ? "is-done" : ""}">
                <input type="checkbox" data-action="toggle-thread-task" data-thread="${escAttr(thread.id)}" data-id="${escAttr(task.id)}" ${task.done ? "checked" : ""} aria-label="Toggle ${escAttr(task.text)}">
                <span>${esc(task.text)}</span>
                <button class="plain-button" data-action="delete-thread-task" data-thread="${escAttr(thread.id)}" data-id="${escAttr(task.id)}" type="button">Delete</button>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}
    `;
  }

  function renderChildEntry(child, entry) {
    return `
      <article class="item">
        <div class="item-main">
          <div>
            <p class="item-title">${esc(entry.text)}</p>
            <p class="item-meta">${esc(formatLongDate(entry.date))}</p>
          </div>
          <span class="chip gold">${esc(entry.type)}</span>
        </div>
        <div class="actions-row">
          <button class="plain-button" data-action="delete-child-entry" data-child="${escAttr(child.id)}" data-id="${escAttr(entry.id)}" type="button">Delete</button>
        </div>
      </article>
    `;
  }

  function renderPrayer(item) {
    return `
      <div class="grocery-row ${item.done ? "is-done" : ""}">
        <input type="checkbox" data-action="toggle-prayer" data-id="${escAttr(item.id)}" ${item.done ? "checked" : ""} aria-label="Toggle prayer">
        <span>${esc(item.text)}</span>
        <button class="plain-button" data-action="delete-prayer" data-id="${escAttr(item.id)}" type="button">Delete</button>
      </div>
    `;
  }

  function renderSimpleItem(item, label, color) {
    return `
      <article class="item">
        <p class="item-title">${esc(label)}</p>
        <p class="item-meta">${esc(item.text)}</p>
        <span class="chip ${color}">${esc(formatMonthDay(dateISO(new Date(item.createdAt))))}</span>
      </article>
    `;
  }

  function renderDrawingCard(item) {
    return `
      <article class="drawing-card">
        <img src="${escAttr(item.image)}" alt="Saved drawing">
        <div>
          <p class="item-meta">${esc(formatLongDate(dateISO(new Date(item.createdAt))))}</p>
          <button class="plain-button" data-action="delete-drawing" data-id="${escAttr(item.id)}" type="button">Delete</button>
        </div>
      </article>
    `;
  }

  function moreTile(view, title, meta) {
    return `
      <button class="tile-button" data-view="${escAttr(view)}" type="button">
        <strong>${esc(title)}</strong>
        <span>${esc(meta)}</span>
      </button>
    `;
  }

  function emptyState(text) {
    return `<div class="empty-state"><span>${esc(text)}</span></div>`;
  }

  function personBadge(id) {
    const member = memberById(id);
    return `<span class="person-dot" style="color: ${escAttr(member.color)}">${esc(member.name)}</span>`;
  }

  function memberOptions(selected) {
    return state.familyMembers.map((member) => `
      <option value="${escAttr(member.id)}" ${member.id === selected ? "selected" : ""}>${esc(member.name)}</option>
    `).join("");
  }

  function memberById(id) {
    return state.familyMembers.find((member) => member.id === id) ||
      state.children.find((child) => child.id === id) ||
      { id, name: id || "Family", color: "#2f6b57" };
  }

  function memberName(id) {
    return memberById(id).name;
  }

  function eventsForDate(day) {
    return state.events.filter((event) => event.date === day).sort(sortEvents);
  }

  function mealForDate(day) {
    return state.meals.find((meal) => meal.date === day);
  }

  function sortEvents(a, b) {
    return `${a.date} ${a.start || ""}`.localeCompare(`${b.date} ${b.start || ""}`);
  }

  function activeNotes() {
    const now = new Date();
    return state.notes
      .filter((note) => {
        if (note.expiresMode === "untilSeen" && note.seen) return false;
        if (note.expiresAt && new Date(note.expiresAt) < now) return false;
        return true;
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
  }

  function activeWishes() {
    return state.wishes.filter((wish) => wish.status !== "Purchased" && wish.status !== "Archived");
  }

  function expirationLabel(note) {
    if (note.expiresMode === "untilSeen") return note.seen ? "seen" : "until seen";
    if (note.expiresMode === "never") return "no expiration";
    if (note.expiresMode === "tonight") return "tonight";
    if (note.expiresMode === "tomorrow") return "tomorrow morning";
    if (note.expiresMode === "weekend") return "this weekend";
    return "temporary";
  }

  function generatePrompts() {
    const today = dateISO(new Date());
    const events = eventsForDate(today);
    const meal = mealForDate(today);
    const openNotes = activeNotes().filter((note) => !note.seen);
    const openTasks = state.threads.flatMap((thread) => thread.tasks.filter((task) => !task.done));
    const prompts = [
      {
        title: "Meal check",
        text: meal
          ? `Dinner is ${meal.name}. What can be done earlier so tonight feels easier?`
          : "Dinner is open. Pick one simple meal before the day gets away from you.",
        view: "meals",
        cta: "Meals"
      },
      {
        title: "Schedule handoff",
        text: events.length
          ? `There are ${events.length} events today. Who owns pickup, bags, and food?`
          : "The calendar is light today. Is there anything worth protecting as family time?",
        view: "calendar",
        cta: "Calendar"
      },
      {
        title: "Kid check-in",
        text: "What did each child need most today: attention, rest, correction, comfort, or celebration?",
        view: "children",
        cta: "Children"
      },
      {
        title: "Marriage check",
        text: "What is one small thing that would make your spouse feel less alone today?",
        view: "faith",
        cta: "Faith"
      },
      {
        title: "Wishlist nudge",
        text: activeWishes().length
          ? "Is one saved wish ready to become a plan, gift, or date?"
          : "Add one date idea, gift idea, or family activity while it is fresh.",
        view: "wishes",
        cta: "Wishes"
      },
      {
        title: "Open loop",
        text: openTasks.length
          ? `There are ${openTasks.length} open planning tasks. What can be closed today?`
          : "No open planning tasks. Is there a decision you should capture before it disappears?",
        view: "plans",
        cta: "Plans"
      },
      {
        title: "Temporary notes",
        text: openNotes.length
          ? `There are ${openNotes.length} active notes. Which one needs action?`
          : "No active notes. Leave one if something should not live in your head.",
        view: "notes",
        cta: "Notes"
      }
    ];
    return rotate(prompts, ui.promptTurn);
  }

  function todaySummary(events, meal, notes) {
    const bits = [];
    bits.push(events.length ? `${events.length} things on the schedule` : "No schedule pressure yet");
    bits.push(meal ? `${meal.name} for dinner` : "dinner still open");
    bits.push(notes.length ? `${notes.length} active notes` : "no active notes");
    return bits.join(", ") + ".";
  }

  function mealIdea() {
    const todayEvents = eventsForDate(dateISO(new Date()));
    const busy = todayEvents.length >= 3;
    const groceries = state.groceries.filter((item) => !item.done).map((item) => item.text).slice(0, 4).join(", ");
    const ideas = [
      busy
        ? "Tonight looks full. Pick a 20-minute dinner and move any chopping to the afternoon."
        : "Choose one dinner that creates leftovers so tomorrow has less pressure.",
      groceries
        ? `Use what is already on the list: ${groceries}. Add one protein and one easy side.`
        : "Before adding a new recipe, check whether a pantry meal can cover one night.",
      "Plan one backup dinner: eggs, quesadillas, pasta, or sandwiches. The backup counts.",
      "If Sunday has margin, prep one protein and one snack bin for the week."
    ];
    return ideas[Math.floor(Math.random() * ideas.length)];
  }

  function dailyVerse() {
    const verses = [
      { ref: "Psalm 90:17", text: "Let the favor of the Lord our God be upon us, and establish the work of our hands." },
      { ref: "Colossians 3:14", text: "Above all these put on love, which binds everything together in perfect harmony." },
      { ref: "Isaiah 40:31", text: "They who wait for the Lord shall renew their strength." },
      { ref: "Proverbs 3:5", text: "Trust in the Lord with all your heart, and do not lean on your own understanding." },
      { ref: "Romans 12:10", text: "Love one another with brotherly affection. Outdo one another in showing honor." },
      { ref: "Philippians 4:6", text: "Do not be anxious about anything, but in everything by prayer and supplication let your requests be made known to God." }
    ];
    const day = Math.floor(new Date().getTime() / 86400000);
    return verses[day % verses.length];
  }

  function latestEncouragement() {
    return state.encouragements[0]?.text || "Leave one another a kind word today.";
  }

  function icon(name) {
    const icons = {
      note: `<svg viewBox="0 0 24 24"><path d="M6 4h12a1 1 0 0 1 1 1v14l-4-2-4 2-4-2-4 2V5a1 1 0 0 1 1-1zM8 8h8M8 12h6"/></svg>`,
      calendar: `<svg viewBox="0 0 24 24"><path d="M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>`,
      meal: `<svg viewBox="0 0 24 24"><path d="M7 3v18M5 3v7a2 2 0 0 0 4 0V3M15 3h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2zM15 14v7"/></svg>`,
      heart: `<svg viewBox="0 0 24 24"><path d="M20 8.5c0 5.5-8 10.5-8 10.5S4 14 4 8.5A4.3 4.3 0 0 1 8.3 4c1.7 0 2.8.8 3.7 2 .9-1.2 2-2 3.7-2A4.3 4.3 0 0 1 20 8.5z"/></svg>`,
      pen: `<svg viewBox="0 0 24 24"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10zM14 7l3 3"/></svg>`
    };
    return icons[name] || icons.note;
  }

  document.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view]");
    if (viewButton) {
      event.preventDefault();
      setView(viewButton.dataset.view);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const action = actionButton.dataset.action;
    if (action === "export-ics") exportICS();
    if (action === "export-data") exportData();
    if (action === "reset-data") resetData();
    if (action === "refresh-prompts") {
      ui.promptTurn = (ui.promptTurn + 1) % 7;
      render();
    }
    if (action === "prompt-note" || action === "meal-idea-note") {
      addNote(actionButton.dataset.text, "Prompt", "tomorrow");
      toast("Saved as a note.");
    }
    if (action === "new-meal-idea") {
      ui.mealIdea = mealIdea();
      render();
    }
    if (action === "delete-event") removeById(state.events, actionButton.dataset.id, "Event deleted.");
    if (action === "delete-meal") removeById(state.meals, actionButton.dataset.id, "Dinner removed.");
    if (action === "toggle-note-seen") toggleItem(state.notes, actionButton.dataset.id, "seen");
    if (action === "toggle-note-pin") toggleItem(state.notes, actionButton.dataset.id, "pinned");
    if (action === "delete-note") removeById(state.notes, actionButton.dataset.id, "Note deleted.");
    if (action === "delete-grocery") removeById(state.groceries, actionButton.dataset.id, "Grocery item deleted.");
    if (action === "set-wish-filter") {
      ui.wishFilter = actionButton.dataset.filter;
      render();
    }
    if (action === "wish-status") setWishStatus(actionButton.dataset.id, actionButton.dataset.status);
    if (action === "wish-thread") createThreadFromWish(actionButton.dataset.id);
    if (action === "delete-wish") removeById(state.wishes, actionButton.dataset.id, "Wish deleted.");
    if (action === "select-thread") {
      ui.selectedThreadId = actionButton.dataset.id;
      render();
    }
    if (action === "mark-decision") markMessageKind(actionButton.dataset.thread, actionButton.dataset.message, "decision");
    if (action === "message-task") createTaskFromMessage(actionButton.dataset.thread, actionButton.dataset.message);
    if (action === "ai-plan-note") addPlanNudge();
    if (action === "delete-thread-task") deleteThreadTask(actionButton.dataset.thread, actionButton.dataset.id);
    if (action === "select-child") {
      ui.selectedChildId = actionButton.dataset.id;
      render();
    }
    if (action === "delete-child-entry") deleteChildEntry(actionButton.dataset.child, actionButton.dataset.id);
    if (action === "delete-prayer") removeById(state.prayers, actionButton.dataset.id, "Prayer removed.");
    if (action === "set-draw-color") {
      ui.drawColor = actionButton.dataset.color;
      render();
    }
    if (action === "clear-drawing") clearDrawing();
    if (action === "undo-drawing") undoDrawing();
    if (action === "save-drawing") saveDrawing();
    if (action === "delete-drawing") removeById(state.drawings, actionButton.dataset.id, "Drawing deleted.");
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    const action = target.dataset.action;
    if (action === "toggle-grocery") toggleItem(state.groceries, target.dataset.id, "done");
    if (action === "toggle-thread-task") toggleThreadTask(target.dataset.thread, target.dataset.id);
    if (action === "toggle-prayer") toggleItem(state.prayers, target.dataset.id, "done");
    if (action === "import-ics" && target.files[0]) importICS(target.files[0]);
    if (action === "import-data" && target.files[0]) importData(target.files[0]);
    if (action === "set-draw-size") {
      ui.drawSize = Number(target.value);
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    const formName = form.dataset.form;
    if (!formName) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (formName === "event") {
      state.events.push({
        id: uid(),
        title: data.title.trim(),
        date: data.date,
        start: data.start,
        end: data.end,
        owner: data.owner,
        responsible: data.responsible,
        location: data.location.trim(),
        prep: data.prep.trim(),
        notes: data.notes.trim()
      });
      form.reset();
      saveAndRender("Event saved.");
    }

    if (formName === "meal") {
      state.meals = state.meals.filter((meal) => meal.date !== data.date);
      state.meals.push({
        id: uid(),
        date: data.date,
        name: data.name.trim(),
        prep: data.prep.trim(),
        tags: data.tags.trim()
      });
      splitList(data.groceries).forEach((text) => state.groceries.push({ id: uid(), text, done: false }));
      form.reset();
      saveAndRender("Dinner saved.");
    }

    if (formName === "grocery") {
      state.groceries.push({ id: uid(), text: data.text.trim(), done: false });
      form.reset();
      saveAndRender("Grocery item added.");
    }

    if (formName === "note") {
      addNote(data.text.trim(), data.category, data.expiresMode, data.pinned === "true");
      form.reset();
      toast("Note saved.");
    }

    if (formName === "wish") {
      state.wishes.push({
        id: uid(),
        title: data.title.trim(),
        type: data.type,
        owner: data.owner,
        url: data.url.trim(),
        priority: data.priority,
        status: "Saved",
        occasion: data.occasion.trim(),
        notes: data.notes.trim()
      });
      form.reset();
      saveAndRender("Wish saved.");
    }

    if (formName === "thread") {
      const thread = {
        id: uid(),
        title: data.title.trim(),
        category: "Plan",
        createdAt: new Date().toISOString(),
        messages: [],
        tasks: []
      };
      state.threads.unshift(thread);
      ui.selectedThreadId = thread.id;
      form.reset();
      saveAndRender("Thread created.");
    }

    if (formName === "message") {
      const thread = state.threads.find((item) => item.id === data.threadId);
      if (thread) {
        thread.messages.push({
          id: uid(),
          author: data.author,
          text: data.text.trim(),
          createdAt: new Date().toISOString(),
          kind: data.kind
        });
        if (data.kind === "task") {
          thread.tasks.push({ id: uid(), text: data.text.trim(), done: false });
        }
        form.reset();
        saveAndRender("Message sent.");
      }
    }

    if (formName === "child-entry") {
      const child = state.children.find((item) => item.id === data.childId);
      if (child) {
        child.entries.push({
          id: uid(),
          type: data.type,
          date: data.date,
          text: data.text.trim()
        });
        form.reset();
        saveAndRender("Child entry saved.");
      }
    }

    if (formName === "prayer") {
      state.prayers.unshift({ id: uid(), text: data.text.trim(), createdAt: new Date().toISOString(), done: false });
      form.reset();
      saveAndRender("Prayer added.");
    }

    if (formName === "gratitude") {
      state.gratitude.unshift({ id: uid(), text: data.text.trim(), createdAt: new Date().toISOString() });
      form.reset();
      saveAndRender("Gratitude added.");
    }

    if (formName === "encouragement") {
      state.encouragements.unshift({ id: uid(), text: data.text.trim(), createdAt: new Date().toISOString(), from: "Family" });
      form.reset();
      saveAndRender("Encouragement sent.");
    }
  });

  window.addEventListener("hashchange", () => {
    const next = getInitialView();
    if (next !== currentView) {
      currentView = next;
      render();
    }
  });

  function addNote(text, category = "Home", expiresMode = "untilSeen", pinned = false) {
    state.notes.unshift({
      id: uid(),
      text,
      category,
      createdAt: new Date().toISOString(),
      expiresMode,
      expiresAt: expirationDate(expiresMode),
      pinned,
      seen: false
    });
    saveAndRender();
  }

  function setWishStatus(id, status) {
    const wish = state.wishes.find((item) => item.id === id);
    if (!wish) return;
    wish.status = status;
    saveAndRender(`Wish marked ${status.toLowerCase()}.`);
  }

  function createThreadFromWish(id) {
    const wish = state.wishes.find((item) => item.id === id);
    if (!wish) return;
    const thread = {
      id: uid(),
      title: wish.title,
      category: "Wishlist",
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: uid(),
          author: "PONDERERS",
          text: `Should "${wish.title}" become a plan, gift, purchase, or calendar event?`,
          createdAt: new Date().toISOString(),
          kind: "message"
        }
      ],
      tasks: []
    };
    state.threads.unshift(thread);
    ui.selectedThreadId = thread.id;
    saveState();
    setView("plans");
    toast("Planning thread created.");
  }

  function markMessageKind(threadId, messageId, kind) {
    const thread = state.threads.find((item) => item.id === threadId);
    const message = thread?.messages.find((item) => item.id === messageId);
    if (!message) return;
    message.kind = kind;
    saveAndRender("Message marked.");
  }

  function createTaskFromMessage(threadId, messageId) {
    const thread = state.threads.find((item) => item.id === threadId);
    const message = thread?.messages.find((item) => item.id === messageId);
    if (!thread || !message) return;
    thread.tasks.push({ id: uid(), text: message.text, done: false });
    saveAndRender("Task created.");
  }

  function addPlanNudge() {
    let thread = state.threads.find((item) => item.id === ui.selectedThreadId);
    if (!thread) {
      thread = {
        id: uid(),
        title: "Planning nudge",
        category: "Plan",
        createdAt: new Date().toISOString(),
        messages: [],
        tasks: []
      };
      state.threads.unshift(thread);
      ui.selectedThreadId = thread.id;
    }
    thread.messages.push({
      id: uid(),
      author: "PONDERERS",
      text: "What still needs a decision, who owns it, and should it become an event, note, meal, or wishlist item?",
      createdAt: new Date().toISOString(),
      kind: "message"
    });
    saveAndRender("AI nudge added.");
  }

  function toggleThreadTask(threadId, taskId) {
    const thread = state.threads.find((item) => item.id === threadId);
    const task = thread?.tasks.find((item) => item.id === taskId);
    if (!task) return;
    task.done = !task.done;
    saveAndRender();
  }

  function deleteThreadTask(threadId, taskId) {
    const thread = state.threads.find((item) => item.id === threadId);
    if (!thread) return;
    thread.tasks = thread.tasks.filter((task) => task.id !== taskId);
    saveAndRender("Task deleted.");
  }

  function deleteChildEntry(childId, entryId) {
    const child = state.children.find((item) => item.id === childId);
    if (!child) return;
    child.entries = child.entries.filter((entry) => entry.id !== entryId);
    saveAndRender("Entry deleted.");
  }

  function removeById(list, id, message) {
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) return;
    list.splice(index, 1);
    saveAndRender(message);
  }

  function toggleItem(list, id, key) {
    const item = list.find((entry) => entry.id === id);
    if (!item) return;
    item[key] = !item[key];
    saveAndRender();
  }

  function saveAndRender(message) {
    saveState();
    render();
    if (message) toast(message);
  }

  function exportICS() {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PONDERERS//Family Calendar//EN",
      "CALSCALE:GREGORIAN",
      ...state.events.flatMap(eventToICS),
      "END:VCALENDAR"
    ];
    downloadFile("ponderers-family-calendar.ics", lines.join("\r\n"), "text/calendar");
    toast("Apple Calendar file exported.");
  }

  function eventToICS(event) {
    const start = icsDate(event.date, event.start);
    const end = icsDate(event.date, event.end || event.start);
    return [
      "BEGIN:VEVENT",
      `UID:${event.id}@ponderers.local`,
      `DTSTAMP:${icsDateTime(new Date())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${icsEscape(event.title)}`,
      event.location ? `LOCATION:${icsEscape(event.location)}` : "",
      event.notes || event.prep ? `DESCRIPTION:${icsEscape([event.notes, event.prep].filter(Boolean).join("\\n"))}` : "",
      "END:VEVENT"
    ].filter(Boolean);
  }

  function importICS(file) {
    const reader = new FileReader();
    reader.onload = () => {
      const imported = parseICS(String(reader.result || ""));
      state.events.push(...imported);
      saveAndRender(`${imported.length} Apple Calendar events imported.`);
    };
    reader.readAsText(file);
  }

  function parseICS(text) {
    const clean = text.replace(/\r?\n[ \t]/g, "");
    const blocks = clean.split("BEGIN:VEVENT").slice(1).map((block) => block.split("END:VEVENT")[0]);
    return blocks.map((block) => {
      const summary = getICSProp(block, "SUMMARY") || "Imported event";
      const startRaw = getICSProp(block, "DTSTART") || "";
      const endRaw = getICSProp(block, "DTEND") || "";
      const start = parseICSDate(startRaw);
      const end = parseICSDate(endRaw);
      return {
        id: uid(),
        title: summary,
        date: start.date || dateISO(new Date()),
        start: start.time || "",
        end: end.time || "",
        owner: "family",
        responsible: "family",
        location: getICSProp(block, "LOCATION") || "",
        prep: "",
        notes: getICSProp(block, "DESCRIPTION") || ""
      };
    });
  }

  function getICSProp(block, prop) {
    const line = block.split(/\r?\n/).find((item) => item.startsWith(`${prop}:`) || item.startsWith(`${prop};`));
    if (!line) return "";
    return icsUnescape(line.slice(line.indexOf(":") + 1).trim());
  }

  function parseICSDate(raw) {
    const value = raw.replace(/^.*:/, "").replace(/Z$/, "");
    const datePart = value.slice(0, 8);
    const timePart = value.includes("T") ? value.split("T")[1].slice(0, 4) : "";
    if (!/^\d{8}$/.test(datePart)) return { date: "", time: "" };
    return {
      date: `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`,
      time: timePart ? `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}` : ""
    };
  }

  function exportData() {
    downloadFile("ponderers-data.json", JSON.stringify(state, null, 2), "application/json");
    toast("Family data exported.");
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = normalizeState(JSON.parse(String(reader.result || "{}")));
        saveAndRender("Family data imported.");
      } catch (error) {
        toast("That file could not be imported.");
      }
    };
    reader.readAsText(file);
  }

  function resetData() {
    if (!confirm("Reset PONDERERS sample data on this device?")) return;
    state = seedState();
    saveState();
    setView("today");
    toast("Sample data reset.");
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function setupDrawingCanvas() {
    const canvas = document.getElementById("drawing-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let drawing = false;
    let last = { x: 0, y: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const image = canvas.width ? canvas.toDataURL("image/png") : null;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, rect.height);
      if (image) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = image;
      }
    };

    const point = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const start = (event) => {
      drawing = true;
      ui.drawHistory.push(canvas.toDataURL("image/png"));
      last = point(event);
      canvas.setPointerCapture(event.pointerId);
    };

    const move = (event) => {
      if (!drawing) return;
      const next = point(event);
      ctx.strokeStyle = ui.drawColor;
      ctx.lineWidth = ui.drawSize;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
      last = next;
    };

    const end = () => {
      drawing = false;
    };

    resize();
    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    window.addEventListener("resize", resize);

    canvasCleanup = () => {
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", end);
      canvas.removeEventListener("pointercancel", end);
      window.removeEventListener("resize", resize);
    };
  }

  function clearDrawing() {
    const canvas = document.getElementById("drawing-canvas");
    if (!canvas) return;
    ui.drawHistory.push(canvas.toDataURL("image/png"));
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  function undoDrawing() {
    const canvas = document.getElementById("drawing-canvas");
    const previous = ui.drawHistory.pop();
    if (!canvas || !previous) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = previous;
  }

  function saveDrawing() {
    const canvas = document.getElementById("drawing-canvas");
    if (!canvas) return;
    state.drawings.unshift({ id: uid(), image: canvas.toDataURL("image/png"), createdAt: new Date().toISOString() });
    addNote("Saved a drawing.", "Home", "tomorrow", false);
    toast("Drawing saved.");
  }

  function expirationDate(mode) {
    if (mode === "tonight") return endOfToday().toISOString();
    if (mode === "tomorrow") return addDays(endOfToday(), 1).toISOString();
    if (mode === "weekend") return endOfWeekend().toISOString();
    return null;
  }

  function endOfToday() {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  }

  function endOfWeekend() {
    const date = new Date();
    const day = date.getDay();
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    date.setDate(date.getDate() + daysUntilSunday);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  function dateISO(date) {
    const value = new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function weekDates(date) {
    const start = startOfWeek(date);
    return Array.from({ length: 7 }, (_, index) => dateISO(addDays(start, index)));
  }

  function startOfWeek(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = (day + 6) % 7;
    start.setDate(start.getDate() - diff);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  function formatLongDate(iso) {
    return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${iso}T12:00:00`));
  }

  function formatWeekday(iso) {
    return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(new Date(`${iso}T12:00:00`));
  }

  function formatMonthDay(iso) {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${iso}T12:00:00`));
  }

  function timeRange(event) {
    if (!event.start && !event.end) return "";
    if (event.start && event.end) return `${event.start}-${event.end}`;
    return event.start || event.end || "";
  }

  function icsDate(date, time) {
    if (!time) return date.replaceAll("-", "");
    return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
  }

  function icsDateTime(date) {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  function icsEscape(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function icsUnescape(value) {
    return String(value)
      .replace(/\\n/g, "\n")
      .replace(/\\,/g, ",")
      .replace(/\\;/g, ";")
      .replace(/\\\\/g, "\\");
  }

  function splitList(text) {
    return String(text || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function rotate(list, turn) {
    return list.map((_, index) => list[(index + turn) % list.length]);
  }

  function uid() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function escAttr(value) {
    return esc(value);
  }

  let toastTimer = null;
  function toast(message) {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();
    const note = document.createElement("div");
    note.className = "toast";
    note.textContent = message;
    document.body.appendChild(note);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => note.remove(), 2600);
  }

  render();
})();
