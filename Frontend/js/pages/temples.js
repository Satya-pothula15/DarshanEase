let _templeBrowse = { search: "", city: "", page: 1, temples: [], pages: 1 };

async function _loadTemples(reset) {
  if (reset) { _templeBrowse.page = 1; _templeBrowse.temples = []; }
  const res = await apiGetTemples({
    search: _templeBrowse.search,
    city: _templeBrowse.city,
    page: _templeBrowse.page,
    limit: 9,
  });
  _templeBrowse.temples = reset ? res.temples : _templeBrowse.temples.concat(res.temples);
  _templeBrowse.pages = res.pages;
  _renderTempleResults();
}

function _renderTempleResults() {
  const grid = document.getElementById("templeResultsGrid");
  const loadMoreWrap = document.getElementById("templeLoadMoreWrap");
  if (!grid) return;

  grid.innerHTML = _templeBrowse.temples.length
    ? _templeBrowse.temples.map(t => templeCard(t)).join("")
    : `<div class="empty-state" style="grid-column:1/-1"><h3>No temples found</h3><p>Try a different search term.</p></div>`;

  if (loadMoreWrap) {
    loadMoreWrap.style.display = _templeBrowse.page < _templeBrowse.pages ? "block" : "none";
  }
}

let _templeSearchDebounce = null;
function onTempleSearchInput(value) {
  _templeBrowse.search = value;
  clearTimeout(_templeSearchDebounce);
  _templeSearchDebounce = setTimeout(() => _loadTemples(true), 300);
}

function onTempleStateFilter(value) {
  _templeBrowse.city = value;
  _loadTemples(true);
}

function loadMoreTemples() {
  _templeBrowse.page += 1;
  _loadTemples(false);
}

renderers.temples = async () => {
  _templeBrowse = { search: "", city: "", page: 1, temples: [], pages: 1 };
  let temples = [], pages = 1;
  try {
    const res = await apiGetTemples({ page: 1, limit: 9 });
    temples = res.temples;
    pages = res.pages;
    _templeBrowse.temples = temples;
    _templeBrowse.pages = pages;
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load temples</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  return `
  <div class="page-wrap container">
    <h2 class="page-title">Temples</h2>

    <div class="field" style="max-width:420px;margin-bottom:10px">
      <input placeholder="Search by temple name, city, state or deity…" oninput="onTempleSearchInput(this.value)">
    </div>

    <div class="grid grid-3" id="templeResultsGrid">
      ${temples.map(t => templeCard(t)).join("")}
    </div>

    <div id="templeLoadMoreWrap" style="text-align:center;margin-top:24px;${pages > 1 ? "" : "display:none"}">
      <button class="btn-ghost" onclick="loadMoreTemples()">Load More</button>
    </div>
  </div>
  ${footerHTML()}
`;
};
