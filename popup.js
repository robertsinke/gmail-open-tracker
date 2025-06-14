const API_URL = 'https://gmail-open-tracker.onrender.com/logs';
const eventsDiv = document.getElementById('events');
const emptyDiv = document.getElementById('empty');
const refreshBtn = document.getElementById('refresh');

function renderEvents(events) {
  eventsDiv.innerHTML = '';
  
  // Group events by ID
  const eventsById = {};
  events.forEach(ev => {
    if (!eventsById[ev.id]) {
      eventsById[ev.id] = [];
    }
    eventsById[ev.id].push(ev);
  });
  
  // Collect all subsequent opens (ignoring the first one for each ID)
  const subsequentOpens = [];
  for (const id in eventsById) {
    const opens = eventsById[id];
    // The opens are already sorted by time, so we just slice from the second element
    if (opens.length > 1) {
      subsequentOpens.push(...opens.slice(1));
    }
  }

  if (!subsequentOpens.length) {
    eventsDiv.innerHTML = '<div id="empty">No genuine opens detected yet.</div>';
    return;
  }

  subsequentOpens.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'event';

    const date = new Date(ev.timestamp);
    const options = { 
        timeZone: 'Europe/Amsterdam', 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = date.toLocaleString('en-GB', options);

    div.innerHTML = `<span class="timestamp">${formattedDate}</span><br>
      ${ev.subject ? `<span class='subject'>📧 ${ev.subject}</span><br>` : ''}
      ${ev.to ? `<span class='to'>👤 ${ev.to}</span>` : ''}`;
    eventsDiv.appendChild(div);
  });
}

async function fetchEvents() {
  emptyDiv.textContent = 'Loading events...';
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch logs');
    const data = await res.json();
    renderEvents(data.events || []);
  } catch (err) {
    eventsDiv.innerHTML = `<div id="empty">Error: ${err.message}</div>`;
  }
}

refreshBtn.addEventListener('click', fetchEvents);

// Initial load
fetchEvents(); 