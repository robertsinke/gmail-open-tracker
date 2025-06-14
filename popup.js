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
  
  // Create a list of emails that have been opened more than once.
  const genuineOpens = [];
  for (const id in eventsById) {
    const opens = eventsById[id];
    if (opens.length > 1) {
      genuineOpens.push({
        lastOpen: opens[opens.length - 1], // The most recent open event
        count: opens.length - 1 // The number of subsequent opens
      });
    }
  }

  if (!genuineOpens.length) {
    eventsDiv.innerHTML = '<div id="empty">No genuine opens detected yet.</div>';
    return;
  }

  // Sort by the most recent open
  genuineOpens.sort((a, b) => new Date(b.lastOpen.timestamp) - new Date(a.lastOpen.timestamp));

  genuineOpens.forEach(item => {
    const div = document.createElement('div');
    div.className = 'event';
    const ev = item.lastOpen;
    const openCount = item.count;
    const openText = openCount === 1 ? '1 time' : `${openCount} times`;

    const date = new Date(ev.timestamp);
    const options = { 
        timeZone: 'Europe/Amsterdam', 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const formattedDate = date.toLocaleString('en-GB', options);

    div.innerHTML = `<span class="timestamp">${formattedDate}</span><br>
      ${ev.subject ? `<span class='subject'>📧 ${ev.subject}</span><br>` : ''}
      ${ev.to ? `<span class='to'>👤 ${ev.to}</span><br>` : ''}
      <span class="count">👁️ Opened ${openText}</span>`;
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