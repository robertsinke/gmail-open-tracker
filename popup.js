const API_URL = 'https://gmail-open-tracker.onrender.com/logs';
const eventsDiv = document.getElementById('events');
const emptyDiv = document.getElementById('empty');
const refreshBtn = document.getElementById('refresh');

function renderEvents(events) {
  eventsDiv.innerHTML = '';
  if (!events.length) {
    eventsDiv.innerHTML = '<div id="empty">No events found.</div>';
    return;
  }
  
  const uniqueEvents = [];
  const seenIds = new Set();
  
  events.forEach(ev => {
    if (!seenIds.has(ev.id)) {
      uniqueEvents.push(ev);
      seenIds.add(ev.id);
    }
  });

  uniqueEvents.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `<span class="timestamp">${ev.timestamp}</span><br>
      <span class="id">${ev.id}</span><br>
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